import { AppError } from "../common/app-error";
import { recordOf, requiredString } from "../common/input";
import type { Actor } from "../identity/access";
import type { PrismaService } from "../infrastructure/prisma.service";
import { appointmentNotice, type NotificationsService } from "../notifications/notifications.service";
import { withOpenSlot } from "./book-slot";
import { closeExpiredRequests } from "./close-expired";
import { allowedStarts, clinicDate, instantOf, loadOffering, managesVisit, reasonOf } from "./visit-access";
import { patientMayAccept, rescheduleOutcome, staffMayConfirm, visitHasStarted } from "./visit-window";

type Notices = NotificationsService;

export async function bookVisit(prisma: PrismaService, notices: Notices, patientId: string, body: unknown) {
  const input = recordOf(body);
  const startsAt = instantOf(input.startsAt);
  const idempotencyKey = typeof input.idempotencyKey === "string" ? input.idempotencyKey : undefined;
  const existing = await existingBooking(prisma, patientId, idempotencyKey);
  if (existing) return { id: existing.id };
  const offering = await loadOffering(prisma, requiredString(input.offeringId, "Ծառայություն"));
  await assertBookable(prisma, notices, offering, startsAt);
  const endsAt = new Date(startsAt.getTime() + offering.durationMinutes * 60_000);
  const created = await withOpenSlot(prisma, offering.doctorId, startsAt, endsAt, undefined, (tx) =>
    tx.appointment.create({
      data: {
        patientId,
        doctorId: offering.doctorId,
        clinicId: offering.clinicId,
        offeringId: offering.id,
        startsAt,
        endsAt,
        priceAmd: offering.priceAmd,
        isEstimate: offering.isEstimate,
        idempotencyKey,
        status: "REQUESTED",
        proposedBy: "PATIENT",
      },
    }),
  );
  await notices.afterAppointment(created, appointmentNotice.requested);
  return { id: created.id };
}

export async function confirmVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string) {
  const now = new Date();
  if ((await closeExpiredRequests(prisma, notices, now)).includes(id)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  const appointment = await openVisit(prisma, id);
  if (appointment.status !== "REQUESTED" || visitHasStarted(appointment.startsAt, now)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  if (!(await mayConfirm(prisma, actor, appointment))) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  const changed = await prisma.appointment.updateMany({
    where: { id, status: "REQUESTED", startsAt: { gt: now } },
    data: { status: "CONFIRMED" },
  });
  if (changed.count !== 1) throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  const updated = await prisma.appointment.findUniqueOrThrow({ where: { id } });
  await notices.afterAppointment(updated, appointmentNotice.confirmed);
  return { id };
}

export async function cancelVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string, body: unknown) {
  const now = new Date();
  if ((await closeExpiredRequests(prisma, notices, now)).includes(id)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  const appointment = await openVisit(prisma, id);
  if (!(await mayCancel(prisma, actor, appointment))) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  if (visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_STARTED", 409, "Այցն արդեն սկսվել է");
  const reason = reasonOf(body);
  const changed = await prisma.appointment.updateMany({
    where: { id, status: { in: ["REQUESTED", "CONFIRMED"] }, startsAt: { gt: now } },
    data: { status: "CANCELLED", cancelReason: reason },
  });
  if (changed.count !== 1) throw new AppError("VISIT_STARTED", 409, "Այցն արդեն սկսվել է");
  const updated = await prisma.appointment.findUniqueOrThrow({ where: { id } });
  await notices.afterAppointment(updated, cancelNotice(actor.role), reason);
  return { id };
}

export async function completeVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string) {
  const now = new Date();
  const appointment = await confirmedVisit(prisma, actor, id);
  if (!visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_NOT_STARTED", 409, "Այցը դեռ չի սկսվել");
  const changed = await prisma.appointment.updateMany({
    where: { id, status: "CONFIRMED", startsAt: { lte: now } },
    data: { status: "COMPLETED" },
  });
  if (changed.count !== 1) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  const updated = await prisma.appointment.findUniqueOrThrow({ where: { id } });
  await notices.afterAppointment(updated, appointmentNotice.completed);
  return { id };
}

export async function missVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string) {
  const now = new Date();
  const appointment = await confirmedVisit(prisma, actor, id);
  if (!visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_NOT_STARTED", 409, "Այցը դեռ չի սկսվել");
  const changed = await prisma.appointment.updateMany({
    where: { id, status: "CONFIRMED", startsAt: { lte: now } },
    data: { status: "NO_SHOW" },
  });
  if (changed.count !== 1) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  const updated = await prisma.appointment.findUniqueOrThrow({ where: { id } });
  await notices.afterAppointment(updated, appointmentNotice.noShow);
  return { id };
}

export async function rescheduleVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string, body: unknown) {
  const now = new Date();
  if ((await closeExpiredRequests(prisma, notices, now)).includes(id)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  const appointment = await openVisit(prisma, id);
  const isPatient = actor.role === "PATIENT" && actor.id === appointment.patientId;
  if (!isPatient && !(await managesVisit(prisma, actor, appointment))) {
    throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  }
  if (visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_STARTED", 409, "Այցն արդեն սկսվել է");
  const startsAt = instantOf(recordOf(body).startsAt);
  const offering = await loadOffering(prisma, appointment.offeringId);
  await assertBookable(prisma, notices, offering, startsAt, appointment.id);
  const endsAt = new Date(startsAt.getTime() + offering.durationMinutes * 60_000);
  const outcome = rescheduleOutcome(isPatient, openStatus(appointment.status));
  const updated = await withOpenSlot(prisma, offering.doctorId, startsAt, endsAt, id, async (tx) => {
    const changed = await tx.appointment.updateMany({
      where: { id, status: { in: ["REQUESTED", "CONFIRMED"] } },
      data: { startsAt, endsAt, status: outcome.status, proposedBy: outcome.proposedBy },
    });
    if (changed.count !== 1) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
    return tx.appointment.findUniqueOrThrow({ where: { id } });
  });
  await notices.afterAppointment(updated, moveNotice(actor.role));
  return { id };
}

async function existingBooking(prisma: PrismaService, patientId: string, idempotencyKey: string | undefined) {
  if (!idempotencyKey) return null;
  return prisma.appointment.findUnique({ where: { patientId_idempotencyKey: { patientId, idempotencyKey } } });
}

async function assertBookable(
  prisma: PrismaService,
  notices: Notices,
  offering: Awaited<ReturnType<typeof loadOffering>>,
  startsAt: Date,
  ignoreId?: string,
) {
  const allowed = await allowedStarts(prisma, notices, offering, clinicDate(startsAt, offering.clinic.timeZone), ignoreId);
  if (!allowed.some((start) => start.getTime() === startsAt.getTime())) {
    throw new AppError("SLOT_UNAVAILABLE", 409, "Այդ ժամը ազատ չէ");
  }
}

async function openVisit(prisma: PrismaService, id: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || (appointment.status !== "REQUESTED" && appointment.status !== "CONFIRMED")) {
    throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  }
  return appointment;
}

async function confirmedVisit(prisma: PrismaService, actor: Actor, id: string) {
  const appointment = await prisma.appointment.findUnique({ where: { id } });
  if (!appointment || appointment.status !== "CONFIRMED" || !(await managesVisit(prisma, actor, appointment))) {
    throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  }
  return appointment;
}

async function mayConfirm(prisma: PrismaService, actor: Actor, appointment: { patientId: string; proposedBy: "PATIENT" | "STAFF"; clinicId: string; doctorId: string }) {
  const patientAccepts = actor.role === "PATIENT" && actor.id === appointment.patientId && patientMayAccept(appointment.proposedBy);
  const staffConfirms = staffMayConfirm(appointment.proposedBy) && (await managesVisit(prisma, actor, appointment));
  return patientAccepts || staffConfirms;
}

async function mayCancel(prisma: PrismaService, actor: Actor, appointment: { patientId: string; clinicId: string; doctorId: string }) {
  const isPatient = actor.role === "PATIENT" && actor.id === appointment.patientId;
  return isPatient || managesVisit(prisma, actor, appointment);
}

function openStatus(status: string): "REQUESTED" | "CONFIRMED" {
  if (status === "REQUESTED" || status === "CONFIRMED") return status;
  throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
}

function cancelNotice(role: Actor["role"]): string {
  if (role === "PATIENT") return appointmentNotice.cancelledByPatient;
  if (role === "DOCTOR") return appointmentNotice.cancelledByDoctor;
  return appointmentNotice.cancelledByClinic;
}

function moveNotice(role: Actor["role"]): string {
  if (role === "PATIENT") return appointmentNotice.rescheduledByPatient;
  if (role === "DOCTOR") return appointmentNotice.rescheduledByDoctor;
  return appointmentNotice.rescheduledByClinic;
}
