import { AppError } from "../common/app-error";
import { displayNameOf, recordOf, requiredString } from "../common/input";
import { catalogLocale } from "../catalog/locale-copy";
import type { PrismaService } from "../infrastructure/prisma.service";

const specialtyMax = 80;
const bioMax = 600;

type OwnedDoctor = { id: string; userId: string };

export async function ownedDoctor(prisma: PrismaService, clinicId: string, doctorId: string): Promise<OwnedDoctor> {
  const doctor = await prisma.doctorProfile.findFirst({
    where: { id: doctorId, clinicId },
    select: { id: true, userId: true },
  });
  if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
  return doctor;
}

/** Updates the Armenian doctor name, specialty, and bio. */
export async function updateDoctor(
  prisma: PrismaService,
  clinicId: string,
  doctorId: string,
  body: unknown,
): Promise<{ id: string }> {
  const doctor = await ownedDoctor(prisma, clinicId, doctorId);
  const input = recordOf(body);
  const displayName = displayNameOf(input.displayName);
  const specialty = capped(requiredString(input.specialty, "Մասնագիտություն"), specialtyMax);
  const bio = optionalText(input.bio, bioMax);
  await prisma.$transaction([
    prisma.user.update({ where: { id: doctor.userId }, data: { displayName } }),
    prisma.doctorProfile.update({ where: { id: doctor.id }, data: { specialty, bio } }),
  ]);
  return { id: doctor.id };
}

/** Stores one English or Russian copy. Empty text falls back to Armenian on the public page. */
export async function saveDoctorLocale(
  prisma: PrismaService,
  clinicId: string,
  doctorId: string,
  body: unknown,
): Promise<{ ok: true }> {
  const doctor = await ownedDoctor(prisma, clinicId, doctorId);
  const input = recordOf(body);
  const locale = catalogLocale(input.locale);
  if (!locale) throw new AppError("VALIDATION_FAILED", 400, "Լեզուն սխալ է");
  const text = {
    name: optionalName(input.displayName),
    specialty: optionalText(input.specialty, specialtyMax),
    bio: optionalText(input.bio, bioMax),
  };
  await prisma.doctorLocale.upsert({
    where: { doctorId_locale: { doctorId: doctor.id, locale } },
    create: { doctorId: doctor.id, locale, ...text },
    update: text,
  });
  return { ok: true };
}

function capped(text: string, max: number): string {
  if (text.length > max) throw new AppError("VALIDATION_FAILED", 400, "Տեքստը չափազանց երկար է");
  return text;
}

function optionalText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return capped(value.trim(), max);
}

function optionalName(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") return "";
  return displayNameOf(value);
}
