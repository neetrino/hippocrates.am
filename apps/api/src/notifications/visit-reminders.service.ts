import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { LIST_PAGE_SIZE } from "../common/pagination";
import type { Prisma } from "../generated/prisma/client";
import { PrismaService } from "../infrastructure/prisma.service";
import { deliverPendingNoticeMails, saveNotices } from "./notice-mail";
import { appointmentNotice, noticeAudience } from "./notifications.service";
import { dueReminder, reminderKey } from "./reminder-window";

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * 60 * 60 * 1000;
const REMINDER_LOCK_KEY = 1_094_821;

@Injectable()
export class VisitRemindersService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VisitRemindersService.name);
  private timer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit(): void {
    void this.sendDue();
    this.timer = setInterval(() => void this.sendDue(), MINUTE_MS);
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async sendDue(now = new Date()): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      await this.writeDue(now);
    } catch (error) {
      this.logger.error("Visit reminder failed", error instanceof Error ? error.stack : undefined);
    } finally {
      this.running = false;
    }
    try {
      await deliverPendingNoticeMails(this.prisma);
    } catch (error) {
      this.logger.error("Visit mail failed", error instanceof Error ? error.stack : undefined);
    }
  }

  private async writeDue(now: Date): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const [lock] = await tx.$queryRaw<{ acquired: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(${REMINDER_LOCK_KEY}) AS acquired
      `;
      if (!lock?.acquired) return;
      await this.writeBatch(tx, now);
    });
  }

  private async writeBatch(db: Prisma.TransactionClient, now: Date): Promise<void> {
    const hourBoundary = new Date(now.getTime() + HOUR_MS);
    const visits = await db.appointment.findMany({
      where: {
        status: "CONFIRMED",
        OR: [
          {
            startsAt: { gt: now, lte: hourBoundary },
            notifications: { none: { body: appointmentNotice.reminderHour } },
          },
          {
            startsAt: { gt: hourBoundary, lte: new Date(now.getTime() + DAY_MS) },
            notifications: { none: { body: appointmentNotice.reminderDay } },
          },
        ],
      },
      orderBy: [{ startsAt: "asc" }, { id: "asc" }],
      take: LIST_PAGE_SIZE,
      select: { id: true, patientId: true, startsAt: true, doctor: { select: { userId: true } } },
    });
    if (visits.length === 0) return;
    const bookedAt = await this.bookedAt(db, visits.map((visit) => visit.id));
    const drafted = visits.flatMap((visit) => this.rowsFor(visit, now, bookedAt.get(visit.id) ?? null));
    const allowed = new Set(await noticeAudience(db, drafted.map((row) => row.userId)));
    const data = drafted.filter((row) => allowed.has(row.userId));
    if (data.length === 0) return;
    await saveNotices(db, data);
  }

  private rowsFor(
    visit: { id: string; patientId: string | null; startsAt: Date; doctor: { userId: string } },
    now: Date,
    bookedAt: Date | null,
  ): { userId: string; appointmentId: string; body: string; dedupeKey: string }[] {
    const kind = dueReminder(visit.startsAt, now, bookedAt);
    if (!kind) return [];
    const body = kind === "day" ? appointmentNotice.reminderDay : appointmentNotice.reminderHour;
    const ids = visit.patientId ? [visit.patientId, visit.doctor.userId] : [visit.doctor.userId];
    return [...new Set(ids)].map((userId) => ({
      userId,
      appointmentId: visit.id,
      body,
      dedupeKey: reminderKey(visit.id, userId, kind, visit.startsAt),
    }));
  }

  private async bookedAt(db: Prisma.TransactionClient, appointmentIds: string[]): Promise<Map<string, Date>> {
    const notices = await db.notification.findMany({
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
