import { AppError } from "../common/app-error";
import { recordOf, requiredString } from "../common/input";
import type { Actor } from "../identity/access";
import type { PrismaService } from "../infrastructure/prisma.service";
import { appointmentNotice, type NotificationsService } from "../notifications/notifications.service";
import { appendCreated, applyTransition, visitActor } from "./appointment-machine";
import { withOpenSlot } from "./book-slot";
import { closeExpiredRequests } from "./close-expired";
import { allowedStarts, clinicDate, instantOf, loadOffering, managesVisit, reasonOf } from "./visit-access";
import { patientMayAccept, rescheduleOutcome, staffMayConfirm, visitHasStarted } from "./visit-window";
import { assertPatientDeadline, assertPatientMayBook } from "../settings/platform-guard";
import { loadPlatformSettings } from "../settings/platform-settings";

type Notices = NotificationsService;

export async function bookVisit(prisma: PrismaService, notices: Notices, patientId: string, body: unknown) {
  const input = recordOf(body);
  const startsAt = instantOf(input.startsAt);
  const idempotencyKey = requiredString(input.idempotencyKey, "Կրկնակի հարցման բանալի", 80);
  const existing = await existingBooking(prisma, patientId, idempotencyKey);
  if (existing) return { id: existing.id };
  const offering = await loadOffering(prisma, requiredString(input.offeringId, "Ծառայություն"));
  const rules = await loadPlatformSettings(prisma);
  assertPatientMayBook(rules, startsAt, offering.clinic.timeZone, new Date());
  await assertBookable(prisma, notices, offering, startsAt);
  const endsAt = new Date(startsAt.getTime() + offering.durationMinutes * 60_000);
  try {
    const created = await withOpenSlot(prisma, offering.doctorId, startsAt, endsAt, undefined, async (tx) => {
      const row = await tx.appointment.create({
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
      });
      await appendCreated(tx, row, { userId: patientId, role: "PATIENT" });
      await notices.write(tx, row, appointmentNotice.requested, "created");
      return row;
    });
    return { id: created.id };
  } catch (error) {
    if (error instanceof AppError && error.code === "SLOT_UNAVAILABLE") {
      const duplicate = await existingBooking(prisma, patientId, idempotencyKey);
      if (duplicate) return { id: duplicate.id };
    }
    throw error;
  }
}

export async function confirmVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string) {
  const now = new Date();
  if ((await closeExpiredRequests(prisma, notices, now, { appointmentId: id })).includes(id)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  const appointment = await openVisit(prisma, id);
  if (appointment.status !== "REQUESTED" || visitHasStarted(appointment.startsAt, now)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  if (!(await mayConfirm(prisma, actor, appointment))) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  await prisma.$transaction(async (tx) => {
    const updated = await applyTransition(tx, appointment, { type: "CONFIRMED" }, visitActor(actor), now);
    await notices.write(tx, updated, appointmentNotice.confirmed, `confirmed:${now.getTime()}`);
  });
  return { id };
}

export async function cancelVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string, body: unknown) {
  const now = new Date();
  if ((await closeExpiredRequests(prisma, notices, now, { appointmentId: id })).includes(id)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  const appointment = await openVisit(prisma, id);
  if (!(await mayCancel(prisma, actor, appointment))) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  if (visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_STARTED", 409, "Այցն արդեն սկսվել է");
  if (isPatientActor(actor, appointment)) {
    assertPatientDeadline(await loadPlatformSettings(prisma), appointment.startsAt, "cancel", now);
  }
  const reason = reasonOf(body);
  await prisma.$transaction(async (tx) => {
    const updated = await applyTransition(
      tx,
      appointment,
      { type: "CANCELLED", reason },
      visitActor(actor),
      now,
    );
    await notices.write(tx, updated, cancelNotice(actor.role), `cancelled:${now.getTime()}`, reason);
  });
  return { id };
}

export async function completeVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string) {
  const now = new Date();
  const appointment = await confirmedVisit(prisma, actor, id);
  if (!visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_NOT_STARTED", 409, "Այցը դեռ չի սկսվել");
  await prisma.$transaction(async (tx) => {
    const updated = await applyTransition(tx, appointment, { type: "COMPLETED" }, visitActor(actor), now);
    await notices.write(tx, updated, appointmentNotice.completed, `completed:${now.getTime()}`);
  });
  return { id };
}

export async function missVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string) {
  const now = new Date();
  const appointment = await confirmedVisit(prisma, actor, id);
  if (!visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_NOT_STARTED", 409, "Այցը դեռ չի սկսվել");
  await prisma.$transaction(async (tx) => {
    const updated = await applyTransition(tx, appointment, { type: "NO_SHOW" }, visitActor(actor), now);
    await notices.write(tx, updated, appointmentNotice.noShow, `no-show:${now.getTime()}`);
  });
  return { id };
}

export async function rescheduleVisit(prisma: PrismaService, notices: Notices, actor: Actor, id: string, body: unknown) {
  const now = new Date();
  if ((await closeExpiredRequests(prisma, notices, now, { appointmentId: id })).includes(id)) {
    throw new AppError("VISIT_STARTED", 409, "Ժամն արդեն անցել է");
  }
  const appointment = await openVisit(prisma, id);
  const isPatient = isPatientActor(actor, appointment);
  if (!isPatient && !(await managesVisit(prisma, actor, appointment))) {
    throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
  }
  if (visitHasStarted(appointment.startsAt, now)) throw new AppError("VISIT_STARTED", 409, "Այցն արդեն սկսվել է");
  const rules = isPatient ? await loadPlatformSettings(prisma) : null;
  if (rules) assertPatientDeadline(rules, appointment.startsAt, "reschedule", now);
  const startsAt = instantOf(recordOf(body).startsAt);
  const offering = await loadOffering(prisma, appointment.offeringId);
  if (rules) assertPatientMayBook(rules, startsAt, offering.clinic.timeZone, now);
  await assertBookable(prisma, notices, offering, startsAt, appointment.id);
  const endsAt = new Date(startsAt.getTime() + offering.durationMinutes * 60_000);
  const outcome = rescheduleOutcome(isPatient, openStatus(appointment.status), appointment.patientId !== null);
  await withOpenSlot(prisma, offering.doctorId, startsAt, endsAt, id, async (tx) => {
    const updated = await applyTransition(
      tx,
      appointment,
      { type: "RESCHEDULED", startsAt, endsAt, status: outcome.status, proposedBy: outcome.proposedBy },
      visitActor(actor),
      now,
    );
    await notices.write(tx, updated, moveNotice(actor.role), `rescheduled:${now.getTime()}`);
    return updated;
  });
  return { id };
}

async function existingBooking(prisma: PrismaService, patientId: string, idempotencyKey: string) {
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

async function mayConfirm(prisma: PrismaService, actor: Actor, appointment: { patientId: string | null; proposedBy: "PATIENT" | "STAFF"; clinicId: string; doctorId: string }) {
  const patientAccepts = actor.role === "PATIENT" && appointment.patientId === actor.id && patientMayAccept(appointment.proposedBy);
  const staffConfirms = staffMayConfirm(appointment.proposedBy) && (await managesVisit(prisma, actor, appointment));
  return patientAccepts || staffConfirms;
}

function isPatientActor(actor: Actor, appointment: { patientId: string | null }): boolean {
  return appointment.patientId !== null && actor.role === "PATIENT" && actor.id === appointment.patientId;
}

async function mayCancel(prisma: PrismaService, actor: Actor, appointment: { patientId: string | null; clinicId: string; doctorId: string }) {
  return isPatientActor(actor, appointment) || managesVisit(prisma, actor, appointment);
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
