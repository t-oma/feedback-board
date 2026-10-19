import { randomUUID } from "node:crypto";

import { db } from "./index";
import { users } from "./schema/auth";

// The test database is never reset, so every user a test needs is a new one,
// with a random ID and email. No test then depends on the order the tests run
// in or on what an earlier run left behind.
export async function insertTestUser() {
  const id = randomUUID();
  const [user] = await db
    .insert(users)
    .values({ id, name: "Test user", email: `${id}@example.test` })
    .returning();

  if (user === undefined) throw new Error("The test user was not inserted");
  return user;
}
