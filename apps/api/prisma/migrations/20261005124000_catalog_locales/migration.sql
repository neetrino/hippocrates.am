-- Expand-only. Armenian clinic and doctor text stays on the existing columns.
CREATE TABLE "ClinicLocale" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "district" TEXT NOT NULL DEFAULT '',
    "address" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ClinicLocale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClinicLocale_clinicId_locale_key" ON "ClinicLocale"("clinicId", "locale");

ALTER TABLE "ClinicLocale" ADD CONSTRAINT "ClinicLocale_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "DoctorLocale" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "specialty" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "DoctorLocale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DoctorLocale_doctorId_locale_key" ON "DoctorLocale"("doctorId", "locale");

ALTER TABLE "DoctorLocale" ADD CONSTRAINT "DoctorLocale_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
