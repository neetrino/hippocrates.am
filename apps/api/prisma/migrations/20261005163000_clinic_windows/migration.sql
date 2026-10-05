-- Expand-only. Existing doctor windows stay. An empty clinic schedule means the doctor hours still apply.
CREATE TABLE "ClinicWindow" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,

    CONSTRAINT "ClinicWindow_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClinicWindow_clinicId_idx" ON "ClinicWindow"("clinicId");

ALTER TABLE "ClinicWindow" ADD CONSTRAINT "ClinicWindow_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
