-- A phone booking can name a person who has no account. Existing visits keep their patient.
ALTER TABLE "Appointment" ALTER COLUMN "patientId" DROP NOT NULL;
ALTER TABLE "Appointment" ADD COLUMN "guestName" TEXT;
ALTER TABLE "Appointment" ADD COLUMN "guestPhone" TEXT;

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_guest_or_account_check"
CHECK (
  ("patientId" IS NOT NULL AND "guestName" IS NULL AND "guestPhone" IS NULL)
  OR
  ("patientId" IS NULL AND "guestName" IS NOT NULL AND "guestPhone" IS NOT NULL)
);

CREATE INDEX "Appointment_guest_phone_idx" ON "Appointment" ("guestPhone") WHERE "patientId" IS NULL;
