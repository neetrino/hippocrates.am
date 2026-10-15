-- Append-only appointment history. Existing visits are not backfilled.
CREATE TYPE "AppointmentEventType" AS ENUM (
  'CREATED',
  'CONFIRMED',
  'CANCELLED',
  'RESCHEDULED',
  'EXPIRED',
  'COMPLETED',
  'NO_SHOW'
);

CREATE TYPE "AppointmentActorRole" AS ENUM ('PATIENT', 'ADMIN', 'DOCTOR', 'SYSTEM');

CREATE TABLE "AppointmentEvent" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "type" "AppointmentEventType" NOT NULL,
    "fromStatus" "AppointmentStatus",
    "toStatus" "AppointmentStatus" NOT NULL,
    "actorUserId" TEXT,
    "actorRole" "AppointmentActorRole" NOT NULL,
    "reason" TEXT,
    "fromStartsAt" TIMESTAMP(3),
    "toStartsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppointmentEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AppointmentEvent_appointmentId_createdAt_idx" ON "AppointmentEvent"("appointmentId", "createdAt");

ALTER TABLE "AppointmentEvent" ADD CONSTRAINT "AppointmentEvent_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE FUNCTION appointment_event_immutable()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'AppointmentEvent is append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER AppointmentEvent_immutable
BEFORE UPDATE OR DELETE ON "AppointmentEvent"
FOR EACH ROW
EXECUTE FUNCTION appointment_event_immutable();
