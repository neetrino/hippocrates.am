import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { intOf, recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, type Actor } from "../identity/access";
import { Public, Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { daySlots } from "./slots";

@Controller()
export class SchedulingController {
  constructor(private readonly prisma: PrismaService) {}

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
    const input = recordOf(body);
    const windows = Array.isArray(input.windows) ? input.windows : [];
    const data = windows.map((item) => {
      const row = recordOf(item);
      return {
        doctorId,
        weekday: intOf(row.weekday, "Օր", 0, 6),
        startMinute: intOf(row.startMinute, "Սկիզբ", 0, 24 * 60),
        endMinute: intOf(row.endMinute, "Վերջ", 1, 24 * 60),
      };
    });
    await this.prisma.$transaction([
      this.prisma.scheduleWindow.deleteMany({ where: { doctorId } }),
      this.prisma.scheduleWindow.createMany({ data }),
    ]);
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
      include: { clinic: true, doctor: { include: { windows: true } } },
    });
    if (!offering) throw new AppError("NOT_FOUND", 404, "Ծառայությունը չի գտնվել");
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
      windows: offering.doctor.windows,
      durationMinutes: offering.durationMinutes,
      busy: appointments.map((item) => ({ start: item.startsAt, end: item.endsAt })),
      blocked: exceptions.map((item) => ({ start: item.startsAt, end: item.endsAt })),
    }).map((slot) => ({ startsAt: slot.start.toISOString(), busy: slot.busy }));
    return { startsAt: slots.filter((slot) => !slot.busy).map((slot) => slot.startsAt), slots };
  }
}

export function offeringIdFrom(body: unknown): string {
  return requiredString(recordOf(body).offeringId, "Ծառայություն");
}
