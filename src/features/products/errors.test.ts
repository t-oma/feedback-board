import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";
import { describe, expect, it } from "vitest";

import { classifyProductError } from "./errors";

function queryError(code: string, constraint: string) {
  const cause = new DatabaseError("violation", 0, "error");
  cause.code = code;
  cause.constraint = constraint;

  return new DrizzleQueryError("insert into products", [], cause);
}

describe("classifyProductError", () => {
  it("recognizes a second product for the same owner", () => {
    expect(
      classifyProductError(queryError("23505", "products_owner_id_key")),
    ).toBe("ownerHasProduct");
  });

  it("recognizes a slug another product already has", () => {
    expect(classifyProductError(queryError("23505", "products_slug_key"))).toBe(
      "slugTaken",
    );
  });

  it.each([
    ["another unique constraint", queryError("23505", "users_email_key")],
    [
      "a foreign key violation",
      queryError("23503", "products_owner_id_users_id_fkey"),
    ],
    [
      "a query error without a database cause",
      new DrizzleQueryError("insert into products", [], new Error("timeout")),
    ],
    ["an error that is not from a query", new Error("products_slug_key")],
  ])("leaves %s to the unexpected path", (_, error) => {
    expect(classifyProductError(error)).toBeNull();
  });
});
