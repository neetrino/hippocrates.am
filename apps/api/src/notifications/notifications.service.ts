import { Injectable, Logger } from "@nestjs/common";
import type { Appointment } from "../generated/prisma/client";
import { PrismaService } from "../infrastructure/prisma.service";
import { dropSuperAdmins } from "./notice-audience";

export const appointmentNotice = {
  requested: "notice.requested",
  confirmed: "notice.confirmed",
  cancelled: "notice.cancelled",
  expired: "notice.expired",
  rescheduled: "notice.rescheduled",
  completed: "notice.completed",
  reminderDay: "notice.reminderDay",
  reminderHour: "notice.reminderHour",
} as const;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async afterAppointment(appointment: Appointment, body: string): Promise<void> {
    try {
      const admins = await this.prisma.user.findMany({
        where: { clinicId: appointment.clinicId, role: "ADMIN" },
        select: { id: true },
      });
      const doctor = await this.prisma.doctorProfile.findUnique({
        where: { id: appointment.doctorId },
        select: { userId: true },
      });
      const userIds = new Set<string>([appointment.patientId, ...admins.map((admin) => admin.id)]);
      if (doctor) userIds.add(doctor.userId);
      const audience = await noticeAudience(this.prisma, [...userIds]);
      if (audience.length === 0) return;
      await this.prisma.notification.createMany({
        data: audience.map((userId) => ({ userId, appointmentId: appointment.id, body })),
      });
    } catch (error) {
      this.logger.error("Notification insert failed", error instanceof Error ? error.stack : undefined);
    }
  }
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
