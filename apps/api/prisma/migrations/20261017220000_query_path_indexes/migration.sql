-- Query-path indexes only. No table rewrite and no row changes.
-- pg_trgm serves ILIKE name search. The longer catalog indexes replace the
-- two-column status indexes, whose leading columns they still cover.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX "User_displayName_trgm_idx" ON "User" USING gin ("displayName" gin_trgm_ops);
CREATE INDEX "Clinic_name_trgm_idx" ON "Clinic" USING gin ("name" gin_trgm_ops);
CREATE INDEX "ClinicLocale_name_trgm_idx" ON "ClinicLocale" USING gin ("name" gin_trgm_ops);
CREATE INDEX "DoctorLocale_name_trgm_idx" ON "DoctorLocale" USING gin ("name" gin_trgm_ops);

DROP INDEX "Clinic_published_verificationStatus_idx";
CREATE INDEX "Clinic_published_verificationStatus_name_id_idx"
ON "Clinic" ("published", "verificationStatus", "name", "id");

DROP INDEX "DoctorProfile_published_verificationStatus_idx";
CREATE INDEX "DoctorProfile_published_verificationStatus_specialty_idx"
ON "DoctorProfile" ("published", "verificationStatus", "specialty");

CREATE INDEX "Notification_unread_idx" ON "Notification" ("userId") WHERE "readAt" IS NULL;
