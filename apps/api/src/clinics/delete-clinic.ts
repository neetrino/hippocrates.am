import { Logger } from "@nestjs/common";
import { AppError } from "../common/app-error";
import type { PrismaService } from "../infrastructure/prisma.service";

const logger = new Logger("deleteClinic");

/** Removes a clinic together with its admin, doctors, and visits. Patients stay. */
export async function deleteClinicRecord(prisma: PrismaService, clinicId: string): Promise<void> {
  const clinic = await prisma.clinic.findUnique({
    where: { id: clinicId },
    select: { ownerId: true, doctors: { select: { id: true, userId: true } } },
  });
  if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
  const doctorIds = clinic.doctors.map((doctor) => doctor.id);
  const accountIds = [...new Set([clinic.ownerId, ...clinic.doctors.map((doctor) => doctor.userId)])];
  try {
    await prisma.$transaction(async (tx) => {
      await tx.notification.deleteMany({ where: { appointment: { clinicId } } });
      await tx.review.deleteMany({ where: { clinicId } });
      await tx.appointment.deleteMany({ where: { clinicId } });
      if (doctorIds.length > 0) await tx.answer.deleteMany({ where: { doctorId: { in: doctorIds } } });
      await tx.question.updateMany({ where: { clinicId }, data: { clinicId: null } });
      await tx.user.updateMany({ where: { clinicId }, data: { clinicId: null } });
      await tx.clinic.delete({ where: { id: clinicId } });
      await tx.user.deleteMany({ where: { id: { in: accountIds } } });
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error("Clinic delete failed", error instanceof Error ? error.stack : undefined);
    throw new AppError("DELETE_FAILED", 409, "Կլինիկան չջնջվեց");
  }
}
