-- Expand-only. Nullable image keys and an optional district label.
ALTER TABLE "Clinic" ADD COLUMN "district" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Clinic" ADD COLUMN "coverKey" TEXT;
ALTER TABLE "Clinic" ADD COLUMN "logoKey" TEXT;
ALTER TABLE "DoctorProfile" ADD COLUMN "photoKey" TEXT;
