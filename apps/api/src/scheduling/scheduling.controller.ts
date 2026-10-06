import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, type Actor } from "../identity/access";
import { Public, Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { closeExpiredRequests } from "../appointments/close-expired";
import { NotificationsService } from "../notifications/notifications.service";
import { daySlots, openWindows } from "./slots";
import { windowsFrom } from "./windows";

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
    const [clinic, doctors] = await Promise.all([
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
    ]);
    return { clinic, doctors };
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
}

export function offeringIdFrom(body: unknown): string {
  return requiredString(recordOf(body).offeringId, "Ծառայություն");
}
