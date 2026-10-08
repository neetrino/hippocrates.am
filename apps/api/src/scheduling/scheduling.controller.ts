import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, requireRoles, type Actor } from "../identity/access";
import { Public, Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { closeExpiredRequests } from "../appointments/close-expired";
import { NotificationsService } from "../notifications/notifications.service";
import { dayBounds } from "./day-off";
import { daySlots, openWindows } from "./slots";
import { windowsFrom, type StoredWindow } from "./windows";

@Controller()
export class SchedulingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notices: NotificationsService,
  ) {}

  @Post("clinics/:clinicId/doctors/:doctorId/windows")
  @Roles("ADMIN")
  async setWindows(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("doctorId") doctorId: string,
    @Body() body: unknown,
  ): Promise<{ count: number }> {
    requireClinicAdmin(actor, clinicId);
    const doctor = await this.prisma.doctorProfile.findFirst({ where: { id: doctorId, clinicId } });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
    const data = windowsFrom(body).map((window) => ({ doctorId, ...window }));
    await this.prisma.$transaction(async (tx) => {
      await tx.scheduleWindow.deleteMany({ where: { doctorId } });
      if (data.length > 0) await tx.scheduleWindow.createMany({ data });
    });
    return { count: data.length };
  }

  @Get("clinics/:clinicId/hours")
  @Roles("ADMIN")
  async hours(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    const [clinic, doctors, exceptions] = await Promise.all([
      this.prisma.clinicWindow.findMany({
        where: { clinicId },
        select: { weekday: true, startMinute: true, endMinute: true },
        orderBy: { weekday: "asc" },
      }),
      this.prisma.doctorProfile.findMany({
        where: { clinicId },
        select: {
          id: true,
          windows: { select: { weekday: true, startMinute: true, endMinute: true }, orderBy: { weekday: "asc" } },
        },
      }),
      this.prisma.scheduleException.findMany({
        where: { doctor: { clinicId }, endsAt: { gt: new Date() } },
        select: { id: true, doctorId: true, startsAt: true },
        orderBy: { startsAt: "asc" },
      }),
    ]);
    return { clinic, doctors, exceptions };
  }

  @Post("clinics/:clinicId/doctors/:doctorId/exceptions")
  @Roles("ADMIN")
  async closeDay(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("doctorId") doctorId: string,
    @Body() body: unknown,
  ): Promise<{ id: string }> {
    const doctor = await this.clinicDoctor(actor, clinicId, doctorId);
    const bounds = dayBounds(requiredString(recordOf(body).date, "Ամսաթիվ"), doctor.timeZone);
    const overlap = await this.prisma.scheduleException.findFirst({
      where: { doctorId, startsAt: { lt: bounds.endsAt }, endsAt: { gt: bounds.startsAt } },
    });
    if (overlap) throw new AppError("DAY_CLOSED", 409, "Այդ օրը արդեն փակ է");
    const created = await this.prisma.scheduleException.create({ data: { doctorId, ...bounds } });
    return { id: created.id };
  }

  @Delete("clinics/:clinicId/doctors/:doctorId/exceptions/:exceptionId")
  @Roles("ADMIN")
  async openDay(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("doctorId") doctorId: string,
    @Param("exceptionId") exceptionId: string,
  ): Promise<{ id: string }> {
    requireClinicAdmin(actor, clinicId);
    const row = await this.prisma.scheduleException.findFirst({
      where: { id: exceptionId, doctorId, doctor: { clinicId } },
    });
    if (!row) throw new AppError("NOT_FOUND", 404, "Օրը չի գտնվել");
    await this.prisma.scheduleException.delete({ where: { id: row.id } });
    return { id: row.id };
  }

  @Post("clinics/:clinicId/windows")
  @Roles("ADMIN")
  async setClinicWindows(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Body() body: unknown,
  ): Promise<{ count: number }> {
    requireClinicAdmin(actor, clinicId);
    const data = windowsFrom(body).map((window) => ({ clinicId, ...window }));
    await this.prisma.$transaction(async (tx) => {
      await tx.clinicWindow.deleteMany({ where: { clinicId } });
      if (data.length > 0) await tx.clinicWindow.createMany({ data });
    });
    return { count: data.length };
  }

  @Get("doctors/me/hours")
  @Roles("DOCTOR")
  async myHours(@CurrentActor() actor: Actor): Promise<{ clinic: StoredWindow[]; doctor: StoredWindow[] }> {
    const doctor = await this.ownDoctor(actor);
    const [clinic, windows] = await Promise.all([
      this.prisma.clinicWindow.findMany({
        where: { clinicId: doctor.clinicId },
        select: { weekday: true, startMinute: true, endMinute: true },
        orderBy: { weekday: "asc" },
      }),
      this.prisma.scheduleWindow.findMany({
        where: { doctorId: doctor.id },
        select: { weekday: true, startMinute: true, endMinute: true },
        orderBy: { weekday: "asc" },
      }),
    ]);
    return { clinic, doctor: windows };
  }

  @Post("doctors/me/windows")
  @Roles("DOCTOR")
  async setMyWindows(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ count: number }> {
    const doctor = await this.ownDoctor(actor);
    const data = windowsFrom(body).map((window) => ({ doctorId: doctor.id, ...window }));
    await this.prisma.$transaction(async (tx) => {
      await tx.scheduleWindow.deleteMany({ where: { doctorId: doctor.id } });
      if (data.length > 0) await tx.scheduleWindow.createMany({ data });
    });
    return { count: data.length };
  }

  @Public()
  @Get("public/availability")
  async availability(
    @Query("doctorId") doctorId: string,
    @Query("offeringId") offeringId: string,
    @Query("date") date: string,
  ): Promise<{ startsAt: string[]; slots: { startsAt: string; busy: boolean }[] }> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date ?? "")) {
      throw new AppError("VALIDATION_FAILED", 400, "Ամսաթիվը սխալ է");
    }
    const offering = await this.prisma.serviceOffering.findFirst({
      where: { id: offeringId, doctorId, published: true, doctor: { published: true }, clinic: { published: true } },
      include: { clinic: { include: { windows: true } }, doctor: { include: { windows: true } } },
    });
    if (!offering) throw new AppError("NOT_FOUND", 404, "Ծառայությունը չի գտնվել");
    await closeExpiredRequests(this.prisma, this.notices);
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart.getTime() + 48 * 60 * 60_000);
    const [appointments, exceptions] = await Promise.all([
      this.prisma.appointment.findMany({
        where: {
          doctorId,
          status: { in: ["REQUESTED", "CONFIRMED"] },
          startsAt: { lt: dayEnd },
          endsAt: { gt: dayStart },
        },
      }),
      this.prisma.scheduleException.findMany({
        where: { doctorId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
      }),
    ]);
    const slots = daySlots({
      isoDate: date,
      timeZone: offering.clinic.timeZone,
      windows: openWindows(offering.clinic.windows, offering.doctor.windows),
      durationMinutes: offering.durationMinutes,
      busy: appointments.map((item) => ({ start: item.startsAt, end: item.endsAt })),
      blocked: exceptions.map((item) => ({ start: item.startsAt, end: item.endsAt })),
      now: new Date(),
    }).map((slot) => ({ startsAt: slot.start.toISOString(), busy: slot.busy }));
    return { startsAt: slots.filter((slot) => !slot.busy).map((slot) => slot.startsAt), slots };
  }

  private async clinicDoctor(
    actor: Actor,
    clinicId: string,
    doctorId: string,
  ): Promise<{ timeZone: string }> {
    requireClinicAdmin(actor, clinicId);
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: { id: doctorId, clinicId },
      select: { clinic: { select: { timeZone: true } } },
    });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
    return { timeZone: doctor.clinic.timeZone };
  }

  private async ownDoctor(actor: Actor): Promise<{ id: string; clinicId: string }> {
    requireRoles(actor, ["DOCTOR"]);
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId: actor.id },
      select: { id: true, clinicId: true },
    });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
    return doctor;
  }
}

export function offeringIdFrom(body: unknown): string {
  return requiredString(recordOf(body).offeringId, "Ծառայություն");
}
