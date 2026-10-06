import { AppError } from "../common/app-error";
import { recordOf } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";
import { catalogLocale, type CatalogLocale } from "./locale-copy";

type LocaleDraft = {
  name: string;
  district: string;
  address: string;
  description: string;
  doctors: { id: string; name: string; displayName: string; specialty: string; bio: string }[];
};

const limits = { name: 80, district: 80, address: 160, description: 600, specialty: 80, bio: 600 };

function limited(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  const text = value.trim();
  if (text.length > max) throw new AppError("VALIDATION_FAILED", 400, "Տեքստը չափազանց երկար է");
  return text;
}

function doctorDrafts(value: unknown): { id: string; displayName: string; specialty: string; bio: string }[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = recordOf(item);
    const id = typeof row.id === "string" ? row.id.trim() : "";
    if (!id) throw new AppError("VALIDATION_FAILED", 400, "Բժիշկը սխալ է");
    return {
      id,
      displayName: limited(row.displayName, limits.name),
      specialty: limited(row.specialty, limits.specialty),
      bio: limited(row.bio, limits.bio),
    };
  });
}

function emptyDraft(doctors: { id: string; name: string }[]): LocaleDraft {
  return {
    name: "",
    district: "",
    address: "",
    description: "",
    doctors: doctors.map((doctor) => ({ ...doctor, displayName: "", specialty: "", bio: "" })),
  };
}

export async function loadClinicLocales(prisma: PrismaService, clinicId: string): Promise<Record<CatalogLocale, LocaleDraft>> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    include: {
      locales: true,
      doctors: { include: { user: { select: { displayName: true } }, locales: true }, orderBy: { specialty: "asc" } },
    },
  });
  if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
  const doctors = clinic.doctors.map((doctor) => ({ id: doctor.id, name: doctor.user.displayName }));
  const drafts = { en: emptyDraft(doctors), ru: emptyDraft(doctors) };
  for (const locale of ["en", "ru"] as const) {
    const copy = clinic.locales.find((item) => item.locale === locale);
    drafts[locale] = {
      name: copy?.name ?? "",
      district: copy?.district ?? "",
      address: copy?.address ?? "",
      description: copy?.description ?? "",
      doctors: clinic.doctors.map((doctor) => {
        const text = doctor.locales.find((item) => item.locale === locale);
        return {
          id: doctor.id,
          name: doctor.user.displayName,
          displayName: text?.name ?? "",
          specialty: text?.specialty ?? "",
          bio: text?.bio ?? "",
        };
      }),
    };
  }
  return drafts;
}

export async function saveClinicLocale(prisma: PrismaService, clinicId: string, body: unknown): Promise<{ ok: true }> {
  const input = recordOf(body);
  const locale = catalogLocale(input.locale);
  if (!locale) throw new AppError("VALIDATION_FAILED", 400, "Լեզուն սխալ է");
  const doctors = doctorDrafts(input.doctors);
  const ids = new Set(doctors.map((doctor) => doctor.id));
  if (ids.size !== doctors.length) throw new AppError("VALIDATION_FAILED", 400, "Բժիշկը սխալ է");
  const owned = await prisma.doctorProfile.findMany({ where: { clinicId, id: { in: [...ids] } }, select: { id: true } });
  if (owned.length !== ids.size) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
  const clinicText = {
    name: limited(input.name, limits.name),
    district: limited(input.district, limits.district),
    address: limited(input.address, limits.address),
    description: limited(input.description, limits.description),
  };
  await prisma.$transaction(async (tx) => {
    await tx.clinicLocale.upsert({
      where: { clinicId_locale: { clinicId, locale } },
      create: { clinicId, locale, ...clinicText },
      update: clinicText,
    });
    for (const doctor of doctors) {
      const text = { name: doctor.displayName, specialty: doctor.specialty, bio: doctor.bio };
      await tx.doctorLocale.upsert({
        where: { doctorId_locale: { doctorId: doctor.id, locale } },
        create: { doctorId: doctor.id, locale, ...text },
        update: text,
      });
    }
  });
  return { ok: true };
}
