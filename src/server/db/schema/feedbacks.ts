import { sql } from "drizzle-orm";
import {
  check,
  index,
  pgEnum,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import {
  FEEDBACK_STATUSES,
  MAX_FEEDBACK_BODY_LENGTH,
  MAX_FEEDBACK_TITLE_LENGTH,
} from "@/entities/feedback/contracts";

import { users } from "./auth";
import { timestamptz, uuidv7 } from "./columns";
import { products } from "./products";

export const feedbackStatus = pgEnum("feedback_status", FEEDBACK_STATUSES);

export const feedbacks = pgTable(
  "feedbacks",
  {
    id: uuidv7("id").primaryKey(),

    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),

    authorId: text("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    title: varchar("title", {
      length: MAX_FEEDBACK_TITLE_LENGTH,
    }).notNull(),

    body: varchar("body", {
      length: MAX_FEEDBACK_BODY_LENGTH,
    }).notNull(),

    status: feedbackStatus("status").default("open").notNull(),

    completedAt: timestamptz("completed_at"),

    hiddenAt: timestamptz("hidden_at"),

    createdAt: timestamptz("created_at").defaultNow().notNull(),

    updatedAt: timestamptz("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    // A database check constraint enforces that `completedAt` is non-null exactly when status is `completed`.
    check(
      "feedbacks_status_completed_at_check",
      sql`(${table.status} = 'completed') = (${table.completedAt} IS NOT NULL)`,
    ),
    // The public board's list filters on these, and never shows hidden rows.
    // The reading feedback design says why it holds no sort columns.
    index("feedbacks_board_list_idx")
      .on(table.productId, table.status)
      .where(sql`${table.hiddenAt} IS NULL`),
  ],
);
