CREATE INDEX "feedbacks_board_list_idx" ON "feedbacks" ("product_id","status") WHERE "hidden_at" IS NULL;--> statement-breakpoint
CREATE INDEX "votes_feedback_id_idx" ON "votes" ("feedback_id");