import type { PrismaService } from "../infrastructure/prisma.service";
import { appointmentNotice, type NotificationsService } from "../notifications/notifications.service";
import { tryExpire } from "./appointment-machine";

/** Closes unanswered requests whose start time has arrived. Returns the closed ids. */
export async function closeExpiredRequests(
  prisma: PrismaService,
  notices: NotificationsService,
  now = new Date(),
): Promise<string[]> {
  const expired = await prisma.appointment.findMany({
    where: { status: "REQUESTED", startsAt: { lte: now } },
  });
  const closedIds: string[] = [];
  for (const appointment of expired) {
    const closed = await prisma.$transaction(async (tx) => {
      const row = await tryExpire(tx, appointment, now);
      if (row) await notices.write(tx, row, appointmentNotice.expired, `expired:${now.getTime()}`);
      return row;
    });
    if (!closed) continue;
    closedIds.push(closed.id);
  }
  return closedIds;
}
