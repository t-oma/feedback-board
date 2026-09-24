import { sql } from "drizzle-orm";
import { check, pgTable, text, varchar } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { timestamptz, uuidv7 } from "./columns";

export const MAX_PRODUCT_NAME_LENGTH = 80;
export const MIN_PRODUCT_SLUG_LENGTH = 3;
export const MAX_PRODUCT_SLUG_LENGTH = 48;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 500;

export const products = pgTable(
  "products",
  {
    id: uuidv7("id").primaryKey(),

    ownerId: text("owner_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),

    name: varchar("name", {
      length: MAX_PRODUCT_NAME_LENGTH,
    }).notNull(),

    slug: varchar("slug", {
      length: MAX_PRODUCT_SLUG_LENGTH,
    })
      .notNull()
      .unique(),

    description: varchar("description", {
      length: MAX_PRODUCT_DESCRIPTION_LENGTH,
    })
      .default("")
      .notNull(),

    createdAt: timestamptz("created_at").defaultNow().notNull(),

    updatedAt: timestamptz("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // A slug is lowercase words joined by single hyphens, none at either end,
    // and at least `MIN_PRODUCT_SLUG_LENGTH` long. Checking that here makes it
    // true of every row, whoever wrote it, and gives the unique index its
    // meaning: a varchar unique index is case-sensitive, so without this
    // "Orbit" and "orbit" would both be accepted and resolve to different
    // boards.
    check(
      "products_slug_shape_check",
      sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' AND length(${table.slug}) >= ${sql.raw(String(MIN_PRODUCT_SLUG_LENGTH))}`,
    ),
  ],
);
