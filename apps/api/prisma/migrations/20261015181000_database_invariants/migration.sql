-- Additive data-integrity and query-path hardening.
-- Existing invalid rows intentionally make this migration fail instead of being rewritten.
BEGIN;

ALTER TABLE "User" ADD COLUMN "disabledAt" TIMESTAMP(3);
ALTER TABLE "Clinic" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "User_clinicId_idx" ON "User" ("clinicId");
CREATE INDEX "Session_userId_revokedAt_idx" ON "Session" ("userId", "revokedAt");
CREATE INDEX "Session_expiresAt_idx" ON "Session" ("expiresAt");
CREATE UNIQUE INDEX "Clinic_ownerId_key" ON "Clinic" ("ownerId");
CREATE INDEX "Branch_clinicId_idx" ON "Branch" ("clinicId");
CREATE INDEX "DoctorProfile_clinicId_idx" ON "DoctorProfile" ("clinicId");
CREATE INDEX "ServiceOffering_clinicId_idx" ON "ServiceOffering" ("clinicId");
CREATE INDEX "ServiceOffering_doctorId_idx" ON "ServiceOffering" ("doctorId");

DROP INDEX "ClinicWindow_clinicId_idx";
CREATE UNIQUE INDEX "ClinicWindow_clinicId_weekday_key" ON "ClinicWindow" ("clinicId", "weekday");
CREATE UNIQUE INDEX "ScheduleWindow_doctorId_weekday_key" ON "ScheduleWindow" ("doctorId", "weekday");
CREATE INDEX "ScheduleException_doctorId_startsAt_endsAt_idx"
ON "ScheduleException" ("doctorId", "startsAt", "endsAt");

DROP INDEX "Appointment_guest_phone_idx";
CREATE INDEX "Appointment_clinicId_guestPhone_startsAt_idx"
ON "Appointment" ("clinicId", "guestPhone", "startsAt" DESC)
WHERE "patientId" IS NULL AND "guestPhone" IS NOT NULL;
CREATE INDEX "Appointment_clinicId_patientId_idx" ON "Appointment" ("clinicId", "patientId");
CREATE INDEX "Appointment_patientId_startsAt_idx" ON "Appointment" ("patientId", "startsAt");
CREATE INDEX "Appointment_doctorId_startsAt_idx" ON "Appointment" ("doctorId", "startsAt");
CREATE INDEX "Appointment_clinicId_startsAt_idx" ON "Appointment" ("clinicId", "startsAt");
CREATE INDEX "Appointment_status_startsAt_idx" ON "Appointment" ("status", "startsAt");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification" ("userId", "createdAt");
CREATE INDEX "Notification_appointmentId_idx" ON "Notification" ("appointmentId");
CREATE INDEX "Question_status_createdAt_idx" ON "Question" ("status", "createdAt");
CREATE INDEX "Question_clinicId_idx" ON "Question" ("clinicId");
CREATE INDEX "Answer_questionId_published_idx" ON "Answer" ("questionId", "published");
CREATE INDEX "Answer_doctorId_idx" ON "Answer" ("doctorId");
CREATE INDEX "Review_clinicId_createdAt_idx" ON "Review" ("clinicId", "createdAt");
CREATE INDEX "Review_doctorId_idx" ON "Review" ("doctorId");

ALTER TABLE "ServiceOffering" ADD CONSTRAINT "ServiceOffering_values_valid"
CHECK ("priceAmd" BETWEEN 0 AND 100000000 AND "durationMinutes" BETWEEN 5 AND 1440);
ALTER TABLE "ClinicWindow" ADD CONSTRAINT "ClinicWindow_minutes_valid"
CHECK ("weekday" BETWEEN 0 AND 6 AND "startMinute" BETWEEN 0 AND 1439
  AND "endMinute" BETWEEN 1 AND 1440 AND "startMinute" < "endMinute");
ALTER TABLE "ScheduleWindow" ADD CONSTRAINT "ScheduleWindow_minutes_valid"
CHECK ("weekday" BETWEEN 0 AND 6 AND "startMinute" BETWEEN 0 AND 1439
  AND "endMinute" BETWEEN 1 AND 1440 AND "startMinute" < "endMinute");
ALTER TABLE "ScheduleException" ADD CONSTRAINT "ScheduleException_range_valid"
CHECK ("startsAt" < "endsAt");
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_values_valid"
CHECK ("startsAt" < "endsAt" AND "priceAmd" BETWEEN 0 AND 100000000);
ALTER TABLE "Review" ADD CONSTRAINT "Review_rating_valid" CHECK ("rating" BETWEEN 1 AND 5);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "ServiceOffering" offering
    JOIN "DoctorProfile" doctor ON doctor."id" = offering."doctorId"
    WHERE doctor."clinicId" <> offering."clinicId"
  ) THEN
    RAISE EXCEPTION 'ServiceOffering contains a cross-clinic doctor reference';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM "Appointment" appointment
    JOIN "ServiceOffering" offering ON offering."id" = appointment."offeringId"
    WHERE offering."doctorId" <> appointment."doctorId"
       OR offering."clinicId" <> appointment."clinicId"
  ) THEN
    RAISE EXCEPTION 'Appointment contains inconsistent clinic, doctor, or offering references';
  END IF;
  IF EXISTS (
    SELECT 1
    FROM "Review" review
    JOIN "Appointment" appointment ON appointment."id" = review."appointmentId"
    WHERE appointment."patientId" IS DISTINCT FROM review."patientId"
       OR appointment."doctorId" <> review."doctorId"
       OR appointment."clinicId" <> review."clinicId"
  ) THEN
    RAISE EXCEPTION 'Review contains inconsistent appointment references';
  END IF;
END;
$$;

CREATE FUNCTION service_offering_scope_valid()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "DoctorProfile"
    WHERE "id" = NEW."doctorId" AND "clinicId" = NEW."clinicId"
  ) THEN
    RAISE EXCEPTION 'Offering doctor must belong to the offering clinic'
      USING ERRCODE = '23514', CONSTRAINT = 'ServiceOffering_doctor_clinic_match';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ServiceOffering_scope_valid
BEFORE INSERT OR UPDATE OF "doctorId", "clinicId" ON "ServiceOffering"
FOR EACH ROW EXECUTE FUNCTION service_offering_scope_valid();

CREATE FUNCTION appointment_scope_valid()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "ServiceOffering"
    WHERE "id" = NEW."offeringId"
      AND "doctorId" = NEW."doctorId"
      AND "clinicId" = NEW."clinicId"
  ) THEN
    RAISE EXCEPTION 'Appointment offering, doctor, and clinic must match'
      USING ERRCODE = '23514', CONSTRAINT = 'Appointment_scope_match';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER Appointment_scope_valid
BEFORE INSERT OR UPDATE OF "offeringId", "doctorId", "clinicId" ON "Appointment"
FOR EACH ROW EXECUTE FUNCTION appointment_scope_valid();

CREATE FUNCTION review_scope_valid()
RETURNS trigger AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "Appointment"
    WHERE "id" = NEW."appointmentId"
      AND "patientId" = NEW."patientId"
      AND "doctorId" = NEW."doctorId"
      AND "clinicId" = NEW."clinicId"
  ) THEN
    RAISE EXCEPTION 'Review must match its appointment'
      USING ERRCODE = '23514', CONSTRAINT = 'Review_appointment_scope_match';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER Review_scope_valid
BEFORE INSERT OR UPDATE OF "appointmentId", "patientId", "doctorId", "clinicId" ON "Review"
FOR EACH ROW EXECUTE FUNCTION review_scope_valid();

ALTER TABLE "ScheduleException" ADD CONSTRAINT "ScheduleException_no_overlap"
EXCLUDE USING gist (
  "doctorId" WITH =,
  tsrange("startsAt", "endsAt", '[)') WITH &&
);

CREATE OR REPLACE FUNCTION appointment_event_immutable()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' AND pg_trigger_depth() > 1 THEN
    RETURN OLD;
  END IF;
  RAISE EXCEPTION 'AppointmentEvent is append-only';
END;
$$ LANGUAGE plpgsql;

COMMIT;
