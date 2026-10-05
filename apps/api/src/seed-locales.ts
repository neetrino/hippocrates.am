import type { PrismaClient } from "./generated/prisma/client";
import { clinicLocaleCopy, doctorLocaleCopy, reviewLocaleCopy } from "./seed-locale-copy";

type Db = PrismaClient;

async function ensureClinicCopy(prisma: Db, clinicId: string, clinicName: string): Promise<void> {
  const copy = clinicLocaleCopy[clinicName];
  if (!copy) return;
  for (const locale of ["en", "ru"] as const) {
    const existing = await prisma.clinicLocale.findUnique({ where: { clinicId_locale: { clinicId, locale } } });
    if (existing) continue;
    await prisma.clinicLocale.create({ data: { clinicId, locale, ...copy[locale] } });
  }
}

async function ensureDoctorCopy(prisma: Db, doctorId: string, displayName: string): Promise<void> {
  const copy = doctorLocaleCopy[displayName];
  if (!copy) return;
  for (const locale of ["en", "ru"] as const) {
    const existing = await prisma.doctorLocale.findUnique({ where: { doctorId_locale: { doctorId, locale } } });
    if (!existing) {
      await prisma.doctorLocale.create({ data: { doctorId, locale, ...copy[locale] } });
      continue;
    }
    if (!existing.name.trim()) {
      await prisma.doctorLocale.update({ where: { id: existing.id }, data: { name: copy[locale].name } });
    }
  }
}

/** Fills missing English and Russian catalog text. Does not overwrite a clinic's own edits. */
export async function ensureCatalogLocales(prisma: Db, clinicId: string, clinicName: string): Promise<void> {
  await ensureClinicCopy(prisma, clinicId, clinicName);
  const doctors = await prisma.doctorProfile.findMany({
    where: { clinicId },
    select: { id: true, user: { select: { displayName: true } } },
  });
  for (const doctor of doctors) await ensureDoctorCopy(prisma, doctor.id, doctor.user.displayName);
}

/** Fills a missing translation of a review. Leaves a translation the clinic already saved. */
export async function ensureReviewLocales(prisma: Db): Promise<void> {
  const reviews = await prisma.review.findMany({ select: { id: true, body: true } });
  for (const review of reviews) {
    const copy = reviewLocaleCopy[review.body];
    if (!copy) continue;
    for (const locale of ["en", "ru"] as const) {
      const existing = await prisma.reviewLocale.findUnique({ where: { reviewId_locale: { reviewId: review.id, locale } } });
      if (existing) continue;
      await prisma.reviewLocale.create({ data: { reviewId: review.id, locale, ...copy[locale] } });
    }
  }
}
