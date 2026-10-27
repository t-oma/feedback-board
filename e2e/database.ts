import { randomUUID } from "node:crypto";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { users } from "@/server/db/schema/auth";
import { feedbacks } from "@/server/db/schema/feedbacks";
import { products } from "@/server/db/schema/products";

import { testEnvironment } from "../test/load-environment";

// Rows a test reads through the app but nobody can write through it yet. The
// app's own client cannot be imported here, because `server-only` throws
// outside a server bundle, so each call opens a connection of its own.
async function withDatabase<Result>(
  work: (database: ReturnType<typeof drizzle>) => Promise<Result>,
) {
  const pool = new Pool({
    connectionString: testEnvironment.DATABASE_URL,
    max: 1,
  });
  try {
    return await work(drizzle({ client: pool }));
  } finally {
    await pool.end();
  }
}

// An account with no password, so nobody signs in as it.
async function insertUser(database: ReturnType<typeof drizzle>) {
  const id = randomUUID();
  const [user] = await database
    .insert(users)
    .values({ id, name: "E2E Author", email: `${id}@example.test` })
    .returning();

  if (user === undefined) throw new Error("The user was not inserted");
  return user;
}

// A UUID is a valid address that no other run claims.
export function insertBoard() {
  return withDatabase(async (database) => {
    const owner = await insertUser(database);
    const [board] = await database
      .insert(products)
      .values({ ownerId: owner.id, name: "E2E Board", slug: randomUUID() })
      .returning();

    if (board === undefined) throw new Error("The board was not inserted");
    return board;
  });
}

type FeedbackValues = Omit<
  typeof feedbacks.$inferInsert,
  "productId" | "authorId"
>;

export function insertFeedback(productId: string, values: FeedbackValues) {
  return withDatabase(async (database) => {
    const author = await insertUser(database);
    const [feedback] = await database
      .insert(feedbacks)
      .values({ ...values, productId, authorId: author.id })
      .returning();

    if (feedback === undefined) {
      throw new Error("The feedback was not inserted");
    }
    return { ...feedback, authorName: author.name };
  });
}
