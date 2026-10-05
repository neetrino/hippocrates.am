import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, requireRoles, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { appointmentNotice, NotificationsService } from "../notifications/notifications.service";
import { bookableStarts } from "../scheduling/slots";
import { Prisma } from "../generated/prisma/client";

const appointmentCard = {
  id: true,
  startsAt: true,
  status: true,
  priceAmd: true,
  isEstimate: true,
  offering: { select: { name: true } },
  clinic: { select: { name: true, locales: { select: { locale: true, name: true } } } },
  doctor: { select: { user: { select: { displayName: true } }, locales: { select: { locale: true, name: true } } } },
  patient: { select: { displayName: true } },
  review: { select: { id: true } },
} as const;

@Controller("appointments")
export class AppointmentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notices: NotificationsService,
  ) {}

  @Post()
  @Roles("PATIENT")
  async create(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ id: string }> {
    requireRoles(actor, ["PATIENT"]);
    const input = recordOf(body);
    const offeringId = requiredString(input.offeringId, "Ծառայություն");
    const startsAt = new Date(requiredString(input.startsAt, "Ժամ"));
    if (Number.isNaN(startsAt.getTime())) throw new AppError("VALIDATION_FAILED", 400, "Ժամը սխալ է");
    const idempotencyKey = typeof input.idempotencyKey === "string" ? input.idempotencyKey : undefined;
    if (idempotencyKey) {
      const existing = await this.prisma.appointment.findUnique({
        where: { patientId_idempotencyKey: { patientId: actor.id, idempotencyKey } },
      });
      if (existing) return { id: existing.id };
    }
    const offering = await this.loadOffering(offeringId);
    const isoDate = clinicDate(startsAt, offering.clinic.timeZone);
    const allowed = await this.allowedStarts(offering, isoDate);
    if (!allowed.some((start) => start.getTime() === startsAt.getTime())) {
      throw new AppError("SLOT_UNAVAILABLE", 409, "Այդ ժամը ազատ չէ");
    }
    const endsAt = new Date(startsAt.getTime() + offering.durationMinutes * 60_000);
    const created = await this.insertAppointment(actor.id, offering, startsAt, endsAt, idempotencyKey);
    await this.notices.afterAppointment(created, appointmentNotice.requested);
    return { id: created.id };
  }

  @Post(":id/confirm")
  @Roles("ADMIN")
  async confirm(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    const appointment = await this.owned(actor, id, "REQUESTED");
    const updated = await this.prisma.appointment.update({ where: { id: appointment.id }, data: { status: "CONFIRMED" } });
    await this.notices.afterAppointment(updated, appointmentNotice.confirmed);
    return { id: updated.id };
  }

  @Post(":id/cancel")
  async cancel(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || !["REQUESTED", "CONFIRMED"].includes(appointment.status)) {
      throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
    }
    const isPatient = actor.role === "PATIENT" && actor.id === appointment.patientId;
    const isAdmin = actor.role === "ADMIN" && actor.clinicId === appointment.clinicId;
    if (!isPatient && !isAdmin) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
    const updated = await this.prisma.appointment.update({ where: { id }, data: { status: "CANCELLED" } });
    await this.notices.afterAppointment(updated, appointmentNotice.cancelled);
    return { id: updated.id };
  }

  @Post(":id/complete")
  @Roles("ADMIN")
  async complete(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    const appointment = await this.owned(actor, id, "CONFIRMED");
    const updated = await this.prisma.appointment.update({ where: { id: appointment.id }, data: { status: "COMPLETED" } });
    return { id: updated.id };
  }

  @Post(":id/reschedule")
  async reschedule(@CurrentActor() actor: Actor, @Param("id") id: string, @Body() body: unknown): Promise<{ id: string }> {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || !["REQUESTED", "CONFIRMED"].includes(appointment.status)) {
      throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
    }
    const isPatient = actor.role === "PATIENT" && actor.id === appointment.patientId;
    const isAdmin = actor.role === "ADMIN" && actor.clinicId === appointment.clinicId;
    if (!isPatient && !isAdmin) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
    const startsAt = new Date(requiredString(recordOf(body).startsAt, "Ժամ"));
    const offering = await this.loadOffering(appointment.offeringId);
    const isoDate = clinicDate(startsAt, offering.clinic.timeZone);
    const allowed = await this.allowedStarts(offering, isoDate, appointment.id);
    if (!allowed.some((start) => start.getTime() === startsAt.getTime())) {
      throw new AppError("SLOT_UNAVAILABLE", 409, "Այդ ժամը ազատ չէ");
    }
    const endsAt = new Date(startsAt.getTime() + offering.durationMinutes * 60_000);
    const updated = await this.prisma.appointment.update({ where: { id }, data: { startsAt, endsAt } });
    await this.notices.afterAppointment(updated, appointmentNotice.rescheduled);
    return { id: updated.id };
  }

  @Get("mine")
  async mine(@CurrentActor() actor: Actor) {
    if (actor.role === "PATIENT") {
      return this.prisma.appointment.findMany({
        where: { patientId: actor.id },
        orderBy: { startsAt: "desc" },
        select: appointmentCard,
      });
    }
    if (actor.role === "DOCTOR") {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: actor.id } });
      if (!doctor) return [];
      return this.prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        orderBy: { startsAt: "asc" },
        select: appointmentCard,
      });
    }
    if (actor.role === "ADMIN" && actor.clinicId) {
      return this.prisma.appointment.findMany({
        where: { clinicId: actor.clinicId },
        orderBy: { startsAt: "asc" },
        select: appointmentCard,
      });
    }
    throw new AppError("FORBIDDEN", 403, "Այս գործողությունը թույլատրված չէ");
  }

  private async owned(actor: Actor, id: string, status: "REQUESTED" | "CONFIRMED") {
    const appointment = await this.prisma.appointment.findUnique({ where: { id } });
    if (!appointment || appointment.status !== status) throw new AppError("NOT_FOUND", 404, "Ամրագրումը չի գտնվել");
    requireClinicAdmin(actor, appointment.clinicId);
    return appointment;
  }

  private async loadOffering(offeringId: string) {
    const offering = await this.prisma.serviceOffering.findFirst({
      where: { id: offeringId, published: true, doctor: { published: true }, clinic: { published: true } },
      include: { clinic: true, doctor: { include: { windows: true } } },
    });
    if (!offering) throw new AppError("NOT_FOUND", 404, "Ծառայությունը չի գտնվել");
    return offering;
  }

  private async allowedStarts(
    offering: Awaited<ReturnType<AppointmentsController["loadOffering"]>>,
    isoDate: string,
    ignoreAppointmentId?: string,
  ): Promise<Date[]> {
    const dayStart = new Date(`${isoDate}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 48 * 60 * 60_000);
    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId: offering.doctorId,
        id: ignoreAppointmentId ? { not: ignoreAppointmentId } : undefined,
        status: { in: ["REQUESTED", "CONFIRMED"] },
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
    });
    const exceptions = await this.prisma.scheduleException.findMany({
      where: { doctorId: offering.doctorId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
    });
    return bookableStarts({
      isoDate,
      timeZone: offering.clinic.timeZone,
      windows: offering.doctor.windows,
      durationMinutes: offering.durationMinutes,
      busy: appointments.map((item) => ({ start: item.startsAt, end: item.endsAt })),
      blocked: exceptions.map((item) => ({ start: item.startsAt, end: item.endsAt })),
    });
  }

  private async insertAppointment(
    patientId: string,
    offering: { id: string; doctorId: string; clinicId: string; priceAmd: number; isEstimate: boolean },
    startsAt: Date,
    endsAt: Date,
    idempotencyKey: string | undefined,
  ) {
    try {
      return await this.prisma.$transaction(
        (tx) =>
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
            },
          }),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new AppError("SLOT_UNAVAILABLE", 409, "Այդ ժամը ազատ չէ");
      }
      throw error;
    }
  }
}

function clinicDate(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
  return parts;
}
