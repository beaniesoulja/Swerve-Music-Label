CREATE TABLE "newsletter_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "pending_name" text;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "confirmation_token_hash" text;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "confirmation_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "confirmed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "subscription_version" text;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD CONSTRAINT "newsletter_subscribers_confirmation_token_hash_unique" UNIQUE("confirmation_token_hash");