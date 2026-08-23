CREATE TYPE "feedback_status" AS ENUM('open', 'planned', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"product_id" uuid NOT NULL,
	"author_id" text NOT NULL,
	"title" varchar(120) NOT NULL,
	"body" varchar(2000) NOT NULL,
	"status" "feedback_status" DEFAULT 'open'::"feedback_status" NOT NULL,
	"completed_at" timestamp with time zone,
	"hidden_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "feedbacks_status_completed_at_check" CHECK (("status" = 'completed') = ("completed_at" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"owner_id" text NOT NULL UNIQUE,
	"name" varchar(80) NOT NULL,
	"slug" varchar(48) NOT NULL UNIQUE,
	"description" varchar(500) DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"user_id" text,
	"feedback_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "votes_pkey" PRIMARY KEY("user_id","feedback_id")
);
--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "feedbacks" ADD CONSTRAINT "feedbacks_author_id_users_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_owner_id_users_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_feedback_id_feedbacks_id_fkey" FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE;