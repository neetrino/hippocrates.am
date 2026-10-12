-- Additive visit outcomes. Existing rows stay as they are.
ALTER TYPE "AppointmentStatus" ADD VALUE 'EXPIRED';
ALTER TYPE "AppointmentStatus" ADD VALUE 'NO_SHOW';

CREATE TYPE "ScheduleProposal" AS ENUM ('PATIENT', 'STAFF');

ALTER TABLE "Appointment" ADD COLUMN "proposedBy" "ScheduleProposal" NOT NULL DEFAULT 'PATIENT';
ALTER TABLE "Appointment" ADD COLUMN "cancelReason" TEXT;
ALTER TABLE "Notification" ADD COLUMN "detail" TEXT;

-- One open visit per doctor and start. Cancelled, expired, and missed visits do not hold the time.
CREATE UNIQUE INDEX "Appointment_doctor_open_start_key"
ON "Appointment" ("doctorId", "startsAt")
WHERE status IN ('REQUESTED', 'CONFIRMED');
