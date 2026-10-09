import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { db } from "./index";
import { products } from "./schema/products";
import { insertTestUser, uniqueSlug } from "./users.testing";

// The name of the constraint a write violated. The create-product action tells
// a second product from a taken slug by these names, so this pins them.
async function violatedConstraint(write: Promise<unknown>) {
  const error: unknown = await write.then(
    () => null,
    (reason: unknown) => reason,
  );

  if (!(error instanceof DrizzleQueryError)) {
    throw new Error("Expected the write to fail", { cause: error });
  }
  if (!(error.cause instanceof DatabaseError)) {
    throw new Error("Expected a PostgreSQL error", { cause: error.cause });
  }

  return error.cause.constraint;
}

describe("products table", () => {
  it("holds one product per owner", async () => {
    const owner = await insertTestUser();
    await db
      .insert(products)
      .values({ ownerId: owner.id, name: "First", slug: uniqueSlug() });

    await expect(
      violatedConstraint(
        db
          .insert(products)
          .values({ ownerId: owner.id, name: "Second", slug: uniqueSlug() }),
      ),
    ).resolves.toBe("products_owner_id_key");
  });

  it("gives a slug to one product", async () => {
    const [first, second] = await Promise.all([
      insertTestUser(),
      insertTestUser(),
    ]);
    const slug = uniqueSlug();
    await db
      .insert(products)
      .values({ ownerId: first.id, name: "First", slug });

    await expect(
      violatedConstraint(
        db
          .insert(products)
          .values({ ownerId: second.id, name: "Second", slug }),
      ),
    ).resolves.toBe("products_slug_key");
  });

  it.each(["Orbit-cli", "orbit--cli", "-orbit", "orbit-", "orbit cli", "ab"])(
    "rejects the slug %j",
    async (slug) => {
      const owner = await insertTestUser();

      await expect(
        violatedConstraint(
          db
            .insert(products)
            .values({ ownerId: owner.id, name: "Orbit CLI", slug }),
        ),
      ).resolves.toBe("products_slug_shape_check");
    },
  );
});
