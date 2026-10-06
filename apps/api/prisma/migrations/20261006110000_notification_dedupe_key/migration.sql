-- Expand-only. Existing notices keep a null key. PostgreSQL allows many nulls under a unique index.
ALTER TABLE "Notification" ADD COLUMN "dedupeKey" TEXT;

CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");
