import { LIST_PAGE_SIZE } from "../common/pagination";
import type { PrismaService } from "../infrastructure/prisma.service";
import { appointmentNotice, type NotificationsService } from "../notifications/notifications.service";
import { tryExpire } from "./appointment-machine";

type ExpiredScope = { appointmentId?: string; clinicId?: string; doctorId?: string; patientId?: string };

/** Closes unanswered requests whose start time has arrived. Returns the closed ids. */
export async function closeExpiredRequests(
  prisma: PrismaService,
  notices: NotificationsService,
  now = new Date(),
  scope: ExpiredScope = {},
): Promise<string[]> {
  const expired = await prisma.appointment.findMany({
    where: {
      id: scope.appointmentId,
      clinicId: scope.clinicId,
      doctorId: scope.doctorId,
      patientId: scope.patientId,
      status: "REQUESTED",
      startsAt: { lte: now },
    },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
    take: scope.appointmentId ? 1 : LIST_PAGE_SIZE,
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
