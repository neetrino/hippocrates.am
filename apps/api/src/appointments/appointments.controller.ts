import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { pageWindow } from "../common/pagination";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireRoles, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { RateLimitService } from "../identity/rate-limit.service";
import { NotificationsService } from "../notifications/notifications.service";
import { closeExpiredRequests } from "./close-expired";
import { eventSelect, namedEventsForVisits, omitEvents } from "./present-events";
import { bookVisit, cancelVisit, completeVisit, confirmVisit, missVisit, rescheduleVisit } from "./visit-commands";

const appointmentCard = {
  id: true,
  startsAt: true,
  status: true,
  proposedBy: true,
  cancelReason: true,
  priceAmd: true,
  isEstimate: true,
  offering: { select: { id: true, name: true } },
  clinic: { select: { name: true, coverKey: true, locales: { select: { locale: true, name: true } } } },
  doctor: { select: { id: true, user: { select: { displayName: true } }, locales: { select: { locale: true, name: true } } } },
  patient: { select: { displayName: true } },
  guestName: true,
  guestPhone: true,
  review: { select: { id: true } },
  events: { orderBy: { createdAt: "asc" as const }, select: eventSelect },
} as const;

const BOOKING_WINDOW_MS = 10 * 60 * 1000;

function presentAppointment<T extends { clinic: { coverKey: string | null } }>(row: T) {
  const { coverKey, ...clinic } = row.clinic;
  return { ...row, clinic: { ...clinic, coverUrl: publicAssetUrl(coverKey) } };
}

@Controller("appointments")
export class AppointmentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notices: NotificationsService,
    private readonly limits: RateLimitService,
  ) {}

  @Post()
  @Roles("PATIENT")
  async create(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ id: string }> {
    requireRoles(actor, ["PATIENT"]);
    await this.limitBooking(actor);
    return bookVisit(this.prisma, this.notices, actor.id, body);
  }

  @Post(":id/confirm")
  async confirm(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    await this.limitBooking(actor);
    return confirmVisit(this.prisma, this.notices, actor, id);
  }

  @Post(":id/cancel")
  async cancel(@CurrentActor() actor: Actor, @Param("id") id: string, @Body() body: unknown): Promise<{ id: string }> {
    await this.limitBooking(actor);
    return cancelVisit(this.prisma, this.notices, actor, id, body);
  }

  @Post(":id/complete")
  @Roles("ADMIN", "DOCTOR")
  async complete(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    await this.limitBooking(actor);
    return completeVisit(this.prisma, this.notices, actor, id);
  }

  @Post(":id/no-show")
  @Roles("ADMIN", "DOCTOR")
  async noShow(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    await this.limitBooking(actor);
    return missVisit(this.prisma, this.notices, actor, id);
  }

  @Post(":id/reschedule")
  async reschedule(@CurrentActor() actor: Actor, @Param("id") id: string, @Body() body: unknown): Promise<{ id: string }> {
    await this.limitBooking(actor);
    return rescheduleVisit(this.prisma, this.notices, actor, id, body);
  }

  @Get("mine")
  async mine(@CurrentActor() actor: Actor, @Query("page") page?: string) {
    await closeExpiredRequests(this.prisma, this.notices);
    if (actor.role === "PATIENT") return this.listed({ patientId: actor.id }, "desc", page);
    if (actor.role === "DOCTOR") {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: actor.id } });
      return doctor ? this.listed({ doctorId: doctor.id }, "asc", page) : [];
    }
    if (actor.role === "ADMIN" && actor.clinicId) return this.listed({ clinicId: actor.clinicId }, "asc", page);
    throw new AppError("FORBIDDEN", 403, "Այս գործողությունը թույլատրված չէ");
  }

  private async listed(where: { patientId: string } | { doctorId: string } | { clinicId: string }, direction: "asc" | "desc", page?: string) {
    const { skip, take } = pageWindow(page);
    const rows = await this.prisma.appointment.findMany({
      where,
      orderBy: { startsAt: direction },
      skip,
      take,
      select: appointmentCard,
    });
    const histories = await namedEventsForVisits(this.prisma, rows);
    return rows.map((row, index) => ({
      ...presentAppointment(omitEvents(row)),
      events: histories[index] ?? [],
    }));
  }

  private limitBooking(actor: Actor): Promise<void> {
    const limit = actor.role === "PATIENT" ? 10 : 30;
    return this.limits.consume(`booking:${actor.id}`, limit, BOOKING_WINDOW_MS);
  }
}
