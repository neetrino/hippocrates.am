CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "patientRegistrationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "bookingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "maxBookingDays" INTEGER NOT NULL DEFAULT 60,
    "minNoticeMinutes" INTEGER NOT NULL DEFAULT 120,
    "cancelDeadlineMinutes" INTEGER NOT NULL DEFAULT 1440,
    "rescheduleDeadlineMinutes" INTEGER NOT NULL DEFAULT 1440,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "PlatformSetting_maxBookingDays_check" CHECK ("maxBookingDays" BETWEEN 1 AND 180),
    CONSTRAINT "PlatformSetting_minNoticeMinutes_check" CHECK ("minNoticeMinutes" BETWEEN 0 AND 10080),
    CONSTRAINT "PlatformSetting_cancelDeadlineMinutes_check" CHECK ("cancelDeadlineMinutes" BETWEEN 0 AND 10080),
    CONSTRAINT "PlatformSetting_rescheduleDeadlineMinutes_check" CHECK ("rescheduleDeadlineMinutes" BETWEEN 0 AND 10080)
);

INSERT INTO "PlatformSetting" (
    "id",
    "patientRegistrationEnabled",
    "bookingEnabled",
    "maxBookingDays",
    "minNoticeMinutes",
    "cancelDeadlineMinutes",
    "rescheduleDeadlineMinutes",
    "updatedAt"
) VALUES ('platform', true, true, 60, 120, 1440, 1440, CURRENT_TIMESTAMP);
