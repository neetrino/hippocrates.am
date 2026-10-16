-- New empty table. Existing notices stay in the app and are not mailed.
CREATE TYPE "NoticeMailStatus" AS ENUM ('PENDING', 'SENT', 'SKIPPED', 'FAILED');

CREATE TABLE "NoticeMail" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "status" "NoticeMailStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticeMail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NoticeMail_notificationId_key" ON "NoticeMail"("notificationId");
CREATE INDEX "NoticeMail_status_createdAt_idx" ON "NoticeMail"("status", "createdAt");

ALTER TABLE "NoticeMail" ADD CONSTRAINT "NoticeMail_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
