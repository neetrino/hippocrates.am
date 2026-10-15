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
    const closed = await prisma.$transaction((tx) => tryExpire(tx, appointment, now));
    if (!closed) continue;
    closedIds.push(closed.id);
    await notices.afterAppointment(appointment, appointmentNotice.expired);
  }
  return closedIds;
}
