import { AppError } from "../common/app-error";
import { recordOf, requiredString } from "../common/input";
import type { Actor } from "../identity/access";
import type { PrismaService } from "../infrastructure/prisma.service";
import { liveOffering } from "../catalog/public-visible";
import { bookableStarts, openWindows } from "../scheduling/slots";
import { closeExpiredRequests } from "./close-expired";

const reasonLimit = 200;

export async function loadOffering(prisma: PrismaService, offeringId: string) {
  const offering = await prisma.serviceOffering.findFirst({
    where: { id: offeringId, ...liveOffering },
    include: { clinic: { include: { windows: true } }, doctor: { include: { windows: true } } },
  });
  if (!offering) throw new AppError("NOT_FOUND", 404, "Ծառայությունը չի գտնվել");
  return offering;
}

export type Offering = Awaited<ReturnType<typeof loadOffering>>;

export async function allowedStarts(
  prisma: PrismaService,
  notices: Parameters<typeof closeExpiredRequests>[1],
  offering: Offering,
  isoDate: string,
  ignoreAppointmentId?: string,
): Promise<Date[]> {
  await closeExpiredRequests(prisma, notices, new Date(), { doctorId: offering.doctorId });
  const dayStart = new Date(`${isoDate}T00:00:00.000Z`);
  const dayEnd = new Date(dayStart.getTime() + 48 * 60 * 60_000);
  const appointments = await prisma.appointment.findMany({
    where: {
      doctorId: offering.doctorId,
      id: ignoreAppointmentId ? { not: ignoreAppointmentId } : undefined,
      status: { in: ["REQUESTED", "CONFIRMED"] },
      startsAt: { lt: dayEnd },
      endsAt: { gt: dayStart },
    },
  });
  const exceptions = await prisma.scheduleException.findMany({
    where: { doctorId: offering.doctorId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
  });
  return bookableStarts({
    isoDate,
    timeZone: offering.clinic.timeZone,
    windows: openWindows(offering.clinic.windows, offering.doctor.windows),
    durationMinutes: offering.durationMinutes,
    busy: appointments.map((item) => ({ start: item.startsAt, end: item.endsAt })),
    blocked: exceptions.map((item) => ({ start: item.startsAt, end: item.endsAt })),
    now: new Date(),
  });
}

export async function managesVisit(
  prisma: PrismaService,
  actor: Actor,
  appointment: { clinicId: string; doctorId: string },
): Promise<boolean> {
  if (actor.role === "ADMIN") return actor.clinicId === appointment.clinicId;
  if (actor.role !== "DOCTOR") return false;
  const doctor = await prisma.doctorProfile.findUnique({ where: { userId: actor.id }, select: { id: true } });
  return doctor?.id === appointment.doctorId;
}

export function clinicDate(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}

export function instantOf(value: unknown): Date {
  const startsAt = new Date(requiredString(value, "Ժամ"));
  if (Number.isNaN(startsAt.getTime())) throw new AppError("VALIDATION_FAILED", 400, "Ժամը սխալ է");
  return startsAt;
}

export function reasonOf(body: unknown): string | null {
  if (body === undefined || body === null || body === "") return null;
  const value = recordOf(body).reason;
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new AppError("VALIDATION_FAILED", 400, "Պատճառը սխալ է");
  const reason = value.trim();
  if (reason.length > reasonLimit) throw new AppError("VALIDATION_FAILED", 400, "Պատճառը շատ երկար է");
  return reason || null;
}
