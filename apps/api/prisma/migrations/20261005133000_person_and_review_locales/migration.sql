-- Expand-only. Official names and the original review stay in place.
ALTER TABLE "DoctorLocale" ADD COLUMN "name" TEXT NOT NULL DEFAULT '';

CREATE TABLE "ReviewLocale" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "reply" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "ReviewLocale_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReviewLocale_reviewId_locale_key" ON "ReviewLocale"("reviewId", "locale");

ALTER TABLE "ReviewLocale" ADD CONSTRAINT "ReviewLocale_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "Review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
