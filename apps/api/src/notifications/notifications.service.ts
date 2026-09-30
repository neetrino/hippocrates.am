import { Injectable, Logger } from "@nestjs/common";
import type { Appointment } from "../generated/prisma/client";
import { PrismaService } from "../infrastructure/prisma.service";

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
      await this.prisma.notification.createMany({
        data: [...userIds].map((userId) => ({ userId, appointmentId: appointment.id, body })),
      });
    } catch (error) {
      this.logger.error("Notification insert failed", error instanceof Error ? error.stack : undefined);
    }
  }
}
