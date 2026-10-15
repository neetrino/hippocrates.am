import { AppError } from "../common/app-error";
import { recordOf } from "../common/input";
import type { Prisma } from "../generated/prisma/client";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import type { PrismaService } from "../infrastructure/prisma.service";

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

export async function listVerificationQueue(prisma: PrismaService): Promise<{
  clinics: QueueClinic[];
  doctors: QueueDoctor[];
}> {
  const where = { verificationStatus: { in: [...pendingStatuses] } };
  const [clinics, doctors] = await Promise.all([
    prisma.clinic.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true, district: true, verificationStatus: true, published: true },
    }),
    prisma.doctorProfile.findMany({
      where,
      orderBy: { user: { displayName: "asc" } },
      select: {
        id: true,
        specialty: true,
        verificationStatus: true,
        published: true,
        clinicId: true,
        user: { select: { displayName: true } },
        clinic: { select: { name: true } },
      },
    }),
  ]);
  return {
    clinics: clinics.map((clinic) => ({
      id: clinic.id,
      kind: "clinic",
      name: clinic.name,
      detail: clinic.district,
      status: clinic.verificationStatus,
      published: clinic.published,
    })),
    doctors: doctors.map((doctor) => ({
      id: doctor.id,
      kind: "doctor",
      name: doctor.user.displayName,
      detail: doctor.specialty,
      clinicName: doctor.clinic.name,
      clinicId: doctor.clinicId,
      status: doctor.verificationStatus,
      published: doctor.published,
    })),
  };
}

export async function listAdminClinics(prisma: PrismaService) {
  const rows = await prisma.clinic.findMany({
    orderBy: { name: "asc" },
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
    },
  });
  return rows.map((clinic) => ({
    id: clinic.id,
    name: clinic.name,
    address: clinic.address,
    district: clinic.district,
    phone: clinic.phone,
    description: clinic.description,
    coverUrl: publicAssetUrl(clinic.coverKey),
    logoUrl: publicAssetUrl(clinic.logoKey),
    published: clinic.published,
    verificationStatus: clinic.verificationStatus,
  }));
}

export async function countPendingReviews(prisma: PrismaService): Promise<number> {
  const where = { verificationStatus: { in: [...pendingStatuses] } };
  const [clinics, doctors] = await Promise.all([
    prisma.clinic.count({ where }),
    prisma.doctorProfile.count({ where }),
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
    await updateClinic(prisma, id, data);
    if (decision === "SUSPEND") {
      await prisma.doctorProfile.updateMany({ where: { clinicId: id }, data: { published: false } });
    }
    return { id };
  }
  await updateDoctor(prisma, id, data);
  return { id };
}

async function updateClinic(
  prisma: PrismaService,
  id: string,
  data: Prisma.ClinicUpdateInput,
): Promise<void> {
  const changed = await prisma.clinic.updateMany({ where: { id }, data });
  if (changed.count !== 1) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
}

async function updateDoctor(
  prisma: PrismaService,
  id: string,
  data: Prisma.DoctorProfileUpdateInput,
): Promise<void> {
  const changed = await prisma.doctorProfile.updateMany({ where: { id }, data });
  if (changed.count !== 1) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
}
