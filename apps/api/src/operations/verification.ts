import { applyClinic, applyDoctor, catalogLocale } from "../catalog/locale-copy";
import { AppError } from "../common/app-error";
import { recordOf } from "../common/input";
import { pageWindow } from "../common/pagination";
import type { Prisma } from "../generated/prisma/client";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import type { PrismaService } from "../infrastructure/prisma.service";
import { clinicCopies } from "../marketplace/clinic-search";

const pendingStatuses = ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "REJECTED", "SUSPENDED"] as const;
const decisions = ["APPROVE", "REJECT", "SUSPEND"] as const;

export type VerificationKind = "clinic" | "doctor";
export type VerificationDecision = (typeof decisions)[number];

type QueueClinic = {
  id: string;
  kind: "clinic";
  name: string;
  detail: string;
  status: string;
  published: boolean;
};

type QueueDoctor = {
  id: string;
  kind: "doctor";
  name: string;
  detail: string;
  clinicName: string;
  clinicId: string;
  status: string;
  published: boolean;
};

/** Maps a Super Admin decision onto status and marketplace visibility. */
export function decisionPatch(decision: VerificationDecision): {
  verificationStatus: "APPROVED" | "REJECTED" | "SUSPENDED";
  published: boolean;
} {
  if (decision === "APPROVE") return { verificationStatus: "APPROVED", published: true };
  if (decision === "REJECT") return { verificationStatus: "REJECTED", published: false };
  return { verificationStatus: "SUSPENDED", published: false };
}

export function decisionOf(body: unknown): VerificationDecision {
  const value = recordOf(body).decision;
  if (typeof value !== "string" || !decisions.includes(value as VerificationDecision)) {
    throw new AppError("VALIDATION_FAILED", 400, "Որոշումը սխալ է");
  }
  return value as VerificationDecision;
}

export function kindOf(value: string): VerificationKind {
  if (value === "clinic" || value === "doctor") return value;
  throw new AppError("VALIDATION_FAILED", 400, "Տեսակը սխալ է");
}

export async function listVerificationQueue(prisma: PrismaService, page?: string, locale?: string): Promise<{
  clinics: QueueClinic[];
  doctors: QueueDoctor[];
}> {
  const language = catalogLocale(locale);
  const status = { verificationStatus: { in: [...pendingStatuses] } };
  const { skip, take } = pageWindow(page);
  const [clinics, doctors] = await Promise.all([
    prisma.clinic.findMany({
      where: { ...status, archivedAt: null },
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip,
      take,
      select: {
        id: true,
        name: true,
        district: true,
        address: true,
        description: true,
        verificationStatus: true,
        published: true,
        locales: { select: { locale: true, name: true, district: true, address: true, description: true } },
      },
    }),
    prisma.doctorProfile.findMany({
      where: { ...status, clinic: { archivedAt: null } },
      orderBy: [{ user: { displayName: "asc" } }, { id: "asc" }],
      skip,
      take,
      select: {
        id: true,
        specialty: true,
        bio: true,
        verificationStatus: true,
        published: true,
        clinicId: true,
        user: { select: { displayName: true } },
        locales: { select: { locale: true, name: true, specialty: true, bio: true } },
        clinic: {
          select: {
            name: true,
            locales: { select: { locale: true, name: true } },
          },
        },
      },
    }),
  ]);
  return {
    clinics: clinics.map((clinic) => {
      const shown = applyClinic(clinic, language);
      return {
        id: clinic.id,
        kind: "clinic",
        name: shown.name,
        detail: shown.district,
        status: clinic.verificationStatus,
        published: clinic.published,
      };
    }),
    doctors: doctors.map((doctor) => {
      const shown = applyDoctor(doctor, language);
      return {
        id: doctor.id,
        kind: "doctor",
        name: shown.user?.displayName ?? doctor.user.displayName,
        detail: shown.specialty,
        clinicName: shown.clinic.name,
        clinicId: doctor.clinicId,
        status: doctor.verificationStatus,
        published: doctor.published,
      };
    }),
  };
}

export async function listAdminClinics(prisma: PrismaService, page?: string, locale?: string) {
  const language = catalogLocale(locale);
  const { skip, take } = pageWindow(page);
  const rows = await prisma.clinic.findMany({
    orderBy: [{ name: "asc" }, { id: "asc" }],
    skip,
    take,
    select: {
      id: true,
      name: true,
      address: true,
      district: true,
      phone: true,
      description: true,
      coverKey: true,
      logoKey: true,
      published: true,
      verificationStatus: true,
      locales: { select: { locale: true, name: true, district: true, address: true, description: true } },
    },
  });
  return rows.map((clinic) => {
    const shown = applyClinic(clinic, language);
    return {
      id: clinic.id,
      name: shown.name,
      address: shown.address,
      district: shown.district,
      phone: clinic.phone,
      description: shown.description,
      coverUrl: publicAssetUrl(clinic.coverKey),
      logoUrl: publicAssetUrl(clinic.logoKey),
      published: clinic.published,
      verificationStatus: clinic.verificationStatus,
      copies: clinicCopies(clinic),
    };
  });
}

export async function countPendingReviews(prisma: PrismaService): Promise<number> {
  const status = { verificationStatus: { in: [...pendingStatuses] } };
  const [clinics, doctors] = await Promise.all([
    prisma.clinic.count({ where: { ...status, archivedAt: null } }),
    prisma.doctorProfile.count({ where: { ...status, clinic: { archivedAt: null } } }),
  ]);
  return clinics + doctors;
}

export async function applyVerification(
  prisma: PrismaService,
  kind: VerificationKind,
  id: string,
  decision: VerificationDecision,
): Promise<{ id: string }> {
  const data = decisionPatch(decision);
  if (kind === "clinic") {
    await prisma.$transaction(async (tx) => {
      await updateClinic(tx, id, data);
      if (decision === "SUSPEND") {
        await tx.doctorProfile.updateMany({ where: { clinicId: id }, data: { published: false } });
      }
    });
    return { id };
  }
  await updateDoctor(prisma, id, data);
  return { id };
}

async function updateClinic(
  prisma: Pick<PrismaService, "clinic">,
  id: string,
  data: Prisma.ClinicUpdateInput,
): Promise<void> {
  const changed = await prisma.clinic.updateMany({ where: { id, archivedAt: null }, data });
  if (changed.count !== 1) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
}

async function updateDoctor(
  prisma: Pick<PrismaService, "doctorProfile">,
  id: string,
  data: Prisma.DoctorProfileUpdateInput,
): Promise<void> {
  const changed = await prisma.doctorProfile.updateMany({ where: { id }, data });
  if (changed.count !== 1) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
}
