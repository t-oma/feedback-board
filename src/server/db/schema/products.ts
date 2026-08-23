import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { timestamptz, uuidv7 } from "./columns";

export const MAX_PRODUCT_NAME_LENGTH = 80;
export const MAX_PRODUCT_SLUG_LENGTH = 48;
export const MAX_PRODUCT_DESCRIPTION_LENGTH = 500;

export const products = pgTable("products", {
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
});
