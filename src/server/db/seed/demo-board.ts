import { eq } from "drizzle-orm";

import { db } from "../index";
import { users } from "../schema/auth";
import { feedbacks } from "../schema/feedbacks";
import { products } from "../schema/products";
import { votes } from "../schema/votes";
import { demoAuthors, demoFeedback, demoProduct } from "./demo-board-content";

export const DEMO_BOARD_SLUG = "orbit-cli";

type SeedDemoBoardOptions = {
  ownerEmail: string;
  slug?: string;
  // Deletes the board first, with everything visitors wrote on it.
  replace?: boolean;
};

// Nobody can sign in as these people: they have no password. `.invalid` is
// reserved, so no mail sent to them can be delivered. Fixed IDs and emails
// let a second run reuse them.
function demoUser(kind: "author" | "voter", number: number, name: string) {
  return {
    id: `demo-${kind}-${String(number)}`,
    name,
    email: `${kind}-${String(number)}@demo.feedback-board.invalid`,
  };
}

const authors = demoAuthors.map((name, index) =>
  demoUser("author", index + 1, name),
);

// Every item already counts its author's vote, so the item with the most
// votes needs one voter fewer than its count.
const voters = Array.from(
  { length: Math.max(...demoFeedback.map((item) => item.votes)) - 1 },
  (_, index) => demoUser("voter", index + 1, `Demo voter ${String(index + 1)}`),
);

function daysBefore(now: number, days: number) {
  return new Date(now - days * 24 * 60 * 60 * 1000);
}

export async function seedDemoBoard({
  ownerEmail,
  slug = DEMO_BOARD_SLUG,
  replace = false,
}: SeedDemoBoardOptions) {
  return db.transaction(async (tx) => {
    const owner = await tx.query.users.findFirst({
      where: { email: ownerEmail },
    });
    if (owner === undefined) {
      throw new Error(
        `No account uses ${ownerEmail}. Create it in the app, then seed again.`,
      );
    }

    const ownedProduct = await tx.query.products.findFirst({
      where: { ownerId: owner.id },
    });
    if (ownedProduct !== undefined) {
      if (ownedProduct.slug !== slug) {
        throw new Error(
          `${ownerEmail} already owns the board at /p/${ownedProduct.slug}.`,
        );
      }
      if (!replace) {
        throw new Error(
          `${ownerEmail} already owns /p/${slug}. Pass --replace to seed it again, which deletes everything visitors wrote on it.`,
        );
      }
      await tx.delete(products).where(eq(products.id, ownedProduct.id));
    }

    const slugOwner = await tx.query.products.findFirst({ where: { slug } });
    if (slugOwner !== undefined) {
      throw new Error(`Another account owns /p/${slug}.`);
    }

    const [product] = await tx
      .insert(products)
      .values({ ownerId: owner.id, slug, ...demoProduct })
      .returning();
    if (product === undefined)
      throw new Error("The demo board was not created");

    await tx
      .insert(users)
      .values([...authors, ...voters])
      .onConflictDoNothing();

    const authorIds = new Map(authors.map(({ id, name }) => [name, id]));
    function authorIdOf({ author }: (typeof demoFeedback)[number]) {
      const authorId = authorIds.get(author);
      if (authorId === undefined) throw new Error(`No author ${author}`);
      return authorId;
    }

    const now = Date.now();
    const inserted = await tx
      .insert(feedbacks)
      .values(
        demoFeedback.map((item) => ({
          productId: product.id,
          authorId: authorIdOf(item),
          title: item.title,
          body: item.body,
          status: item.status,
          createdAt: daysBefore(now, item.daysAgo),
          completedAt:
            item.completedDaysAgo === undefined
              ? null
              : daysBefore(now, item.completedDaysAgo),
        })),
      )
      .returning({ id: feedbacks.id, title: feedbacks.title });

    // PostgreSQL documents no order for the rows `RETURNING` gives back, so
    // each item is found again by its title.
    const idByTitle = new Map(inserted.map(({ id, title }) => [title, id]));
    await tx.insert(votes).values(
      demoFeedback.flatMap((item) => {
        const feedbackId = idByTitle.get(item.title);
        if (feedbackId === undefined) throw new Error(`No item ${item.title}`);

        const voterIds = [
          authorIdOf(item),
          ...voters.slice(0, item.votes - 1).map(({ id }) => id),
        ];
        return voterIds.map((userId) => ({ userId, feedbackId }));
      }),
    );

    return product;
  });
}
