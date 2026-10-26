// The table's enum and column types are built from these. Kept apart from the
// table definition, they can be read without loading Drizzle and the table.
export const FEEDBACK_STATUSES = [
  "open",
  "planned",
  "in_progress",
  "completed",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const MAX_FEEDBACK_TITLE_LENGTH = 120;
export const MAX_FEEDBACK_BODY_LENGTH = 2000;
