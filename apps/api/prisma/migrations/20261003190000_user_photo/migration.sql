-- Expand-only. Nullable profile photo key. Existing rows stay valid.
ALTER TABLE "User" ADD COLUMN "photoKey" TEXT;
