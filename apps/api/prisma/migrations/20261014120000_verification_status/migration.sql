-- Verification is separate from marketplace visibility. Existing rows stay approved.
CREATE TYPE "VerificationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

ALTER TABLE "Clinic" ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'APPROVED';
ALTER TABLE "DoctorProfile" ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'APPROVED';

CREATE INDEX "Clinic_published_verificationStatus_idx" ON "Clinic" ("published", "verificationStatus");
CREATE INDEX "DoctorProfile_published_verificationStatus_idx" ON "DoctorProfile" ("published", "verificationStatus");
