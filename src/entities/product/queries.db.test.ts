import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { db } from "@/server/db";
import { products } from "@/server/db/schema/products";
import { slugsTheTableRejects, uniqueSlug } from "@/server/db/slugs.testing";
import { insertTestUser } from "@/server/db/users.testing";

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

  it.each(slugsTheTableRejects)(
    "answers %j without a query, as no product can have it",
    async (slug) => {
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
