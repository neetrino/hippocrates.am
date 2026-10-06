import type { PrismaService } from "../infrastructure/prisma.service";
import { appointmentNotice, type NotificationsService } from "../notifications/notifications.service";

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
    const closed = await prisma.appointment.updateMany({
      where: { id: appointment.id, status: "REQUESTED" },
      data: { status: "CANCELLED" },
    });
    if (closed.count !== 1) continue;
    closedIds.push(appointment.id);
    await notices.afterAppointment(appointment, appointmentNotice.expired);
  }
  return closedIds;
}
