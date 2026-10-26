import { db } from "./index";
import { feedbacks } from "./schema/feedbacks";
import { products } from "./schema/products";
import { votes } from "./schema/votes";
import { uniqueSlug } from "./slugs.testing";
import { insertTestUser } from "./users.testing";

// A board of its own for each test, so feedback another test writes never
// shows up in its list or its counts.
export async function insertTestBoard() {
  const owner = await insertTestUser();
  const [product] = await db
    .insert(products)
    .values({ ownerId: owner.id, name: "Test board", slug: uniqueSlug() })
    .returning();

  if (product === undefined) throw new Error("The test board was not inserted");
  return product;
}

type TestFeedback = Partial<typeof feedbacks.$inferInsert> & {
  productId: string;
};

// A completed item needs its `completedAt` too, or the table refuses it.
export async function insertTestFeedback(values: TestFeedback) {
  const authorId = values.authorId ?? (await insertTestUser()).id;
  const [feedback] = await db
    .insert(feedbacks)
    .values({
      title: "Watch mode that survives a failed build",
      body: "It should log the error and keep watching the file tree.",
      ...values,
      authorId,
    })
    .returning();

  if (feedback === undefined) {
    throw new Error("The test feedback was not inserted");
  }
  return feedback;
}

// Each vote needs a voter of its own, since a user votes once per item.
export async function insertTestVotes(feedbackId: string, count: number) {
  for (let voter = 0; voter < count; voter += 1) {
    const user = await insertTestUser();
    await db.insert(votes).values({ userId: user.id, feedbackId });
  }
}
