-- Sync manual schema changes without resetting data
ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "image" TEXT;

ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PENDING';
