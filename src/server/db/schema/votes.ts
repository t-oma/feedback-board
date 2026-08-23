import { pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { feedbacks } from "./feedbacks";
import { timestamptz } from "./columns";

export const votes = pgTable(
  "votes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),
    feedbackId: uuid("feedback_id")
      .notNull()
      .references(() => feedbacks.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamptz("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.feedbackId] })],
);
