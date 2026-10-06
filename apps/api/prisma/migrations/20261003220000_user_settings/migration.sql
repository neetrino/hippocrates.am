-- Expand-only. Existing users keep visit emails enabled.
ALTER TABLE "User" ADD COLUMN "emailVisitNotices" BOOLEAN NOT NULL DEFAULT true;
