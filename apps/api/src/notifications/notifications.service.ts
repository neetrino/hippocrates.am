import { Injectable, Logger } from "@nestjs/common";
import type { Appointment, Prisma } from "../generated/prisma/client";
import { PrismaService } from "../infrastructure/prisma.service";
import { dropSuperAdmins } from "./notice-audience";
import { queueNoticeMails } from "./notice-mail";

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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async afterAppointment(appointment: Appointment, body: string, detail?: string | null): Promise<void> {
    try {
      const audience = await appointmentAudience(this.prisma, appointment);
      if (audience.length === 0) return;
      await this.prisma.$transaction((tx) => writeAppointmentNotices(tx, audience, appointment.id, body, detail || null));
    } catch (error) {
      this.logger.error("Notification insert failed", error instanceof Error ? error.stack : undefined);
    }
  }
}

async function appointmentAudience(prisma: PrismaService, appointment: Appointment): Promise<string[]> {
  const admins = await prisma.user.findMany({
    where: { clinicId: appointment.clinicId, role: "ADMIN" },
    select: { id: true },
  });
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: appointment.doctorId },
    select: { userId: true },
  });
  const userIds = new Set<string>(admins.map((admin) => admin.id));
  if (appointment.patientId) userIds.add(appointment.patientId);
  if (doctor) userIds.add(doctor.userId);
  return noticeAudience(prisma, [...userIds]);
}

async function writeAppointmentNotices(
  tx: Prisma.TransactionClient,
  audience: readonly string[],
  appointmentId: string,
  body: string,
  detail: string | null,
): Promise<void> {
  const created: { id: string; userId: string }[] = [];
  for (const userId of audience) {
    created.push(
      await tx.notification.create({
        data: { userId, appointmentId, body, detail },
        select: { id: true, userId: true },
      }),
    );
  }
  await queueNoticeMails(tx, created);
}

export async function noticeAudience(prisma: PrismaService, userIds: readonly string[]): Promise<string[]> {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) return [];
  const blocked = await prisma.user.findMany({
    where: { id: { in: unique }, role: "SUPER_ADMIN" },
    select: { id: true },
  });
  return dropSuperAdmins(unique, blocked.map((user) => user.id));
}
