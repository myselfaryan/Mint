ALTER TABLE "problems" ADD COLUMN "code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "problems" ADD CONSTRAINT "problems_code_unique" UNIQUE("code");