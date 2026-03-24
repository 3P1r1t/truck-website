-- Remove deprecated articles module
ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "articles_authorId_fkey";
DROP INDEX IF EXISTS "articles_slug_key";
DROP TABLE IF EXISTS "articles";

