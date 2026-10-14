import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { db } from "@/server/db";
import { products } from "@/server/db/schema/products";
import { insertTestUser, uniqueSlug } from "@/server/db/users.testing";

import { getProductBySlug } from "./queries.server";

describe("getProductBySlug", () => {
  it("finds the product with the slug", async () => {
    const owner = await insertTestUser();
    const slug = uniqueSlug();
    await db
      .insert(products)
      .values({ ownerId: owner.id, name: "Orbit CLI", slug });

    await expect(getProductBySlug(slug)).resolves.toMatchObject({
      name: "Orbit CLI",
      slug,
    });
  });

  it("finds nothing for a slug no product has", async () => {
    await expect(getProductBySlug(uniqueSlug())).resolves.toBeNull();
  });

  // The query is skipped on the grounds that the table holds no such slug,
  // so each value is checked against the table as well.
  it.each(["Orbit-cli", "orbit--cli", "-orbit", "orbit-", "orbit cli", "ab"])(
    "answers %j without a query, as the table would not hold it",
    async (slug) => {
      const owner = await insertTestUser();
      await expect(
        db.insert(products).values({ ownerId: owner.id, name: "Orbit", slug }),
      ).rejects.toMatchObject({
        cause: { constraint: "products_slug_shape_check" },
      });

      const findFirst = vi.spyOn(db.query.products, "findFirst");
      try {
        await expect(getProductBySlug(slug)).resolves.toBeNull();
        expect(findFirst).not.toHaveBeenCalled();
      } finally {
        findFirst.mockRestore();
      }
    },
  );
});
