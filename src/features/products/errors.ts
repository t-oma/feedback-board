import { DrizzleQueryError } from "drizzle-orm";
import { DatabaseError } from "pg";

type ProductErrorKind = "ownerHasProduct" | "slugTaken";

const UNIQUE_VIOLATION = "23505";

// The migration declares both constraints inline, so PostgreSQL names them
// `<table>_<column>_key`. `src/server/db/products.db.test.ts` pins the names,
// and a rename fails there before it silently turns a conflict into an
// unexpected error here.
export function classifyProductError(error: unknown): ProductErrorKind | null {
  if (!(error instanceof DrizzleQueryError)) return null;

  const { cause } = error;
  if (!(cause instanceof DatabaseError) || cause.code !== UNIQUE_VIOLATION) {
    return null;
  }

  switch (cause.constraint) {
    case "products_owner_id_key":
      return "ownerHasProduct";
    case "products_slug_key":
      return "slugTaken";
    default:
      return null;
  }
}
