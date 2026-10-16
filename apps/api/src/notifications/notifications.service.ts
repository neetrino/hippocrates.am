import { Injectable } from "@nestjs/common";
import type { Appointment, Prisma } from "../generated/prisma/client";
import type { PrismaService } from "../infrastructure/prisma.service";
import { dropSuperAdmins } from "./notice-audience";

export const appointmentNotice = {
  requested: "notice.requested",
  confirmed: "notice.confirmed",
  cancelled: "notice.cancelled",
  cancelledByPatient: "notice.cancelledByPatient",
  cancelledByDoctor: "notice.cancelledByDoctor",
  cancelledByClinic: "notice.cancelledByClinic",
  expired: "notice.expired",
  rescheduled: "notice.rescheduled",
  rescheduledByPatient: "notice.rescheduledByPatient",
  rescheduledByDoctor: "notice.rescheduledByDoctor",
  rescheduledByClinic: "notice.rescheduledByClinic",
  noShow: "notice.noShow",
  deskBooked: "notice.deskBooked",
  completed: "notice.completed",
  reminderDay: "notice.reminderDay",
  reminderHour: "notice.reminderHour",
} as const;

type NotificationDb = PrismaService | Prisma.TransactionClient;

@Injectable()
export class NotificationsService {
  async write(
    db: NotificationDb,
    appointment: Appointment,
    body: string,
    eventKey: string,
    detail?: string | null,
  ): Promise<void> {
    const userIds = await appointmentAudience(db, appointment);
    if (userIds.length === 0) return;
    await db.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        appointmentId: appointment.id,
        body,
        detail: detail || null,
        dedupeKey: `${appointment.id}:${eventKey}:${userId}`,
      })),
      skipDuplicates: true,
    });
  }
}

async function appointmentAudience(db: NotificationDb, appointment: Appointment): Promise<string[]> {
  const [admins, doctor] = await Promise.all([
    db.user.findMany({
      where: { clinicId: appointment.clinicId, role: "ADMIN" },
      select: { id: true },
    }),
    db.doctorProfile.findUnique({
      where: { id: appointment.doctorId },
      select: { userId: true },
    }),
  ]);
  const userIds = new Set<string>(admins.map((admin) => admin.id));
  if (appointment.patientId) userIds.add(appointment.patientId);
  if (doctor) userIds.add(doctor.userId);
  return noticeAudience(db, [...userIds]);
}

export async function noticeAudience(db: NotificationDb, userIds: readonly string[]): Promise<string[]> {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return [];
  const blocked = await db.user.findMany({
    where: { id: { in: unique }, role: "SUPER_ADMIN" },
    select: { id: true },
  });
  return dropSuperAdmins(unique, blocked.map((user) => user.id));
}
