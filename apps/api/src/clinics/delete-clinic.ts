import { Logger } from "@nestjs/common";
import { AppError } from "../common/app-error";
import type { PrismaService } from "../infrastructure/prisma.service";

const logger = new Logger("deleteClinic");

/** Archives a clinic, disables its staff, and preserves visits and audit history. */
export async function deleteClinicRecord(prisma: PrismaService, clinicId: string): Promise<void> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: {
      ownerId: true,
      archivedAt: true,
      staff: {
        where: { role: { in: ["ADMIN", "DOCTOR"] } },
        select: { id: true },
      },
    },
  });
  if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
  if (clinic.archivedAt) throw new AppError("CONFLICT", 409, "Կլինիկան արդեն արխիվացված է");
  const accountIds = [...new Set([clinic.ownerId, ...clinic.staff.map((user) => user.id)])];
  const now = new Date();
  try {
    await prisma.$transaction(async (tx) => {
      const archived = await tx.clinic.updateMany({
        where: { id: clinicId, archivedAt: null },
        data: { archivedAt: now, published: false, verificationStatus: "SUSPENDED" },
      });
      if (archived.count !== 1) throw new AppError("CONFLICT", 409, "Կլինիկան արդեն արխիվացված է");
      await tx.doctorProfile.updateMany({
        where: { clinicId },
        data: { published: false, verificationStatus: "SUSPENDED" },
      });
      await tx.user.updateMany({ where: { id: { in: accountIds } }, data: { disabledAt: now } });
      await tx.session.updateMany({
        where: { userId: { in: accountIds }, revokedAt: null },
        data: { revokedAt: now },
      });
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Clinic archive failed", error instanceof Error ? error.stack : undefined);
    throw new AppError("DELETE_FAILED", 409, "Կլինիկան չարխիվացվեց");
  }
}
