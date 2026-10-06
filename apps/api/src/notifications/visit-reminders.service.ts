import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../infrastructure/prisma.service";
import { appointmentNotice } from "./notifications.service";
import { dueReminder, reminderKey } from "./reminder-window";

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class VisitRemindersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VisitRemindersService.name);
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    void this.sendDue();
    this.timer = setInterval(() => void this.sendDue(), MINUTE_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async sendDue(now = new Date()): Promise<void> {
    try {
      await this.writeDue(now);
    } catch (error) {
      this.logger.error("Visit reminder failed", error instanceof Error ? error.stack : undefined);
    }
  }

  private async writeDue(now: Date): Promise<void> {
    const visits = await this.prisma.appointment.findMany({
      where: { status: "CONFIRMED", startsAt: { gt: now, lte: new Date(now.getTime() + DAY_MS) } },
      select: { id: true, patientId: true, startsAt: true, doctor: { select: { userId: true } } },
    });
    if (visits.length === 0) return;
    const bookedAt = await this.bookedAt(visits.map((visit) => visit.id));
    const data = visits.flatMap((visit) => this.rowsFor(visit, now, bookedAt.get(visit.id) ?? null));
    if (data.length === 0) return;
    await this.prisma.notification.createMany({ data, skipDuplicates: true });
  }

  private rowsFor(
    visit: { id: string; patientId: string; startsAt: Date; doctor: { userId: string } },
    now: Date,
    bookedAt: Date | null,
  ): { userId: string; appointmentId: string; body: string; dedupeKey: string }[] {
    const kind = dueReminder(visit.startsAt, now, bookedAt);
    if (!kind) return [];
    const body = kind === "day" ? appointmentNotice.reminderDay : appointmentNotice.reminderHour;
    return [...new Set([visit.patientId, visit.doctor.userId])].map((userId) => ({
      userId,
      appointmentId: visit.id,
      body,
      dedupeKey: reminderKey(visit.id, userId, kind, visit.startsAt),
    }));
  }

  private async bookedAt(appointmentIds: string[]): Promise<Map<string, Date>> {
    const notices = await this.prisma.notification.findMany({
      where: {
        appointmentId: { in: appointmentIds },
        body: { in: [appointmentNotice.requested, "Նոր ամրագրման հայտ"] },
      },
      select: { appointmentId: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const booked = new Map<string, Date>();
    for (const notice of notices) {
      if (notice.appointmentId && !booked.has(notice.appointmentId)) booked.set(notice.appointmentId, notice.createdAt);
    }
    return booked;
  }
}
