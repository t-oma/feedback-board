import { and, count, eq, isNotNull } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { db } from "../index";
import { feedbacks } from "../schema/feedbacks";
import { products } from "../schema/products";
import { votes } from "../schema/votes";
import { uniqueSlug } from "../slugs.testing";
import { insertTestUser } from "../users.testing";
import { seedDemoBoard } from "./demo-board";
import { demoFeedback } from "./demo-board-content";

// The test database is never reset, so each test seeds under a slug of its
// own instead of the demo's.
async function seedForNewOwner() {
  const owner = await insertTestUser();
  const slug = uniqueSlug();
  const product = await seedDemoBoard({ ownerEmail: owner.email, slug });
  return { owner, slug, product };
}

function countsByStatus(statuses: string[]) {
  const counts: Record<string, number> = {};
  for (const status of statuses) counts[status] = (counts[status] ?? 0) + 1;
  return counts;
}

describe("seedDemoBoard", () => {
  it("creates the demo's feedback under each status, all visible", async () => {
    const { product } = await seedForNewOwner();

    const rows = await db
      .select({ status: feedbacks.status, count: count() })
      .from(feedbacks)
      .where(eq(feedbacks.productId, product.id))
      .groupBy(feedbacks.status);
    const hidden = await db.$count(
      feedbacks,
      and(eq(feedbacks.productId, product.id), isNotNull(feedbacks.hiddenAt)),
    );

    expect(
      Object.fromEntries(rows.map((row) => [row.status, row.count])),
    ).toEqual(countsByStatus(demoFeedback.map((item) => item.status)));
    expect(hidden).toBe(0);
  });

  it("gives each item its votes, its author's among them", async () => {
    const { product } = await seedForNewOwner();

    const items = await db
      .select({
        id: feedbacks.id,
        title: feedbacks.title,
        authorId: feedbacks.authorId,
      })
      .from(feedbacks)
      .where(eq(feedbacks.productId, product.id));

    for (const item of items) {
      const expected = demoFeedback.find(({ title }) => title === item.title);
      const voters = await db
        .select({ userId: votes.userId })
        .from(votes)
        .where(eq(votes.feedbackId, item.id));

      expect(voters).toHaveLength(expected?.votes ?? -1);
      expect(voters).toContainEqual({ userId: item.authorId });
    }
  });

  it("refuses to seed the same board again without replace", async () => {
    const { owner, slug } = await seedForNewOwner();

    await expect(
      seedDemoBoard({ ownerEmail: owner.email, slug }),
    ).rejects.toThrow(/--replace/);
  });

  it("replaces the board, with the demo's feedback once", async () => {
    const { owner, slug, product } = await seedForNewOwner();

    const replaced = await seedDemoBoard({
      ownerEmail: owner.email,
      slug,
      replace: true,
    });

    expect(replaced.id).not.toBe(product.id);
    await expect(
      db.$count(feedbacks, eq(feedbacks.productId, replaced.id)),
    ).resolves.toBe(demoFeedback.length);
    await expect(
      db.$count(products, eq(products.id, product.id)),
    ).resolves.toBe(0);
  });

  it("refuses an email no account uses", async () => {
    await expect(
      seedDemoBoard({
        ownerEmail: `${uniqueSlug()}@example.test`,
        slug: uniqueSlug(),
      }),
    ).rejects.toThrow(/No account uses/);
  });

  it("refuses an owner whose board is another one", async () => {
    const owner = await insertTestUser();
    await db
      .insert(products)
      .values({ ownerId: owner.id, name: "Their own", slug: uniqueSlug() });

    await expect(
      seedDemoBoard({
        ownerEmail: owner.email,
        slug: uniqueSlug(),
        replace: true,
      }),
    ).rejects.toThrow(/already owns/);
  });

  it("refuses a slug another account owns", async () => {
    const { slug } = await seedForNewOwner();
    const otherOwner = await insertTestUser();

    await expect(
      seedDemoBoard({ ownerEmail: otherOwner.email, slug }),
    ).rejects.toThrow(/Another account owns/);
    await expect(
      db.$count(
        products,
        and(eq(products.ownerId, otherOwner.id), eq(products.slug, slug)),
      ),
    ).resolves.toBe(0);
  });
});
