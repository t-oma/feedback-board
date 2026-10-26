import { index, pgTable, primaryKey, text, uuid } from "drizzle-orm/pg-core";

import { users } from "./auth";
import { timestamptz } from "./columns";
import { feedbacks } from "./feedbacks";

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
  (table) => [
    primaryKey({ columns: [table.userId, table.feedbackId] }),
    // The primary key begins with the user, so counting one item's votes
    // needs an index that begins with the item.
    index("votes_feedback_id_idx").on(table.feedbackId),
  ],
);
