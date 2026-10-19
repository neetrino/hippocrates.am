import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, requireRoles, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { RateLimitService } from "../identity/rate-limit.service";
import { closeExpiredRequests } from "../appointments/close-expired";
import { listUserNotices } from "../notifications/list-notices";
import { readNoticeIds } from "../notifications/notice-ids";
import { emptyNoticePage, readNoticeCursor, readNoticeLimit } from "../notifications/notice-page";
import { NotificationsService } from "../notifications/notifications.service";
import { bookDeskVisit } from "../appointments/desk-booking";
import { eventSelect, namedEventsForVisits, omitEvents } from "../appointments/present-events";
import { countClinicPatients, listClinicPatients } from "../appointments/guest-visits";
import { liveDoctor } from "../catalog/public-visible";
import { financeWindow } from "./finance-range";
import { applyVerification, countPendingReviews, decisionOf, kindOf, listAdminClinics, listVerificationQueue } from "./verification";

const BOOKING_WINDOW_MS = 10 * 60 * 1000;

@Controller()
export class OperationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notices: NotificationsService,
    private readonly limits: RateLimitService,
  ) {}

  @Get("clinics/:clinicId/dashboard")
  @Roles("ADMIN")
  async dashboard(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    const now = new Date();
    await closeExpiredRequests(this.prisma, this.notices, now, { clinicId });
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 60 * 60_000);
    const [pending, today, patients] = await Promise.all([
      this.prisma.appointment.count({ where: { clinicId, status: "REQUESTED", startsAt: { gt: now } } }),
      this.prisma.appointment.count({ where: { clinicId, startsAt: { gte: start, lt: end } } }),
      countClinicPatients(this.prisma, clinicId),
    ]);
    return { pending, today, patientCount: patients };
  }

  @Get("platform/summary")
  @Roles("SUPER_ADMIN")
  async platformSummary(@CurrentActor() actor: Actor) {
    requireRoles(actor, ["SUPER_ADMIN"]);
    const [clinics, pendingQuestions, publishedDoctors, pendingReviews] = await Promise.all([
      this.prisma.clinic.count({ where: { archivedAt: null } }),
      this.prisma.question.count({ where: { status: "PENDING" } }),
      this.prisma.doctorProfile.count({ where: liveDoctor }),
      countPendingReviews(this.prisma),
    ]);
    return { clinics, pendingQuestions, publishedDoctors, pendingReviews };
  }

  @Get("admin/verification")
  @Roles("SUPER_ADMIN")
  listVerification(@CurrentActor() actor: Actor, @Query("page") page?: string) {
    requireRoles(actor, ["SUPER_ADMIN"]);
    return listVerificationQueue(this.prisma, page);
  }

  @Post("admin/verification/:kind/:id")
  @Roles("SUPER_ADMIN")
  decideVerification(
    @CurrentActor() actor: Actor,
    @Param("kind") kind: string,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    requireRoles(actor, ["SUPER_ADMIN"]);
    return applyVerification(this.prisma, kindOf(kind), id, decisionOf(body));
  }

  @Get("admin/clinics")
  @Roles("SUPER_ADMIN")
  adminClinics(@CurrentActor() actor: Actor, @Query("page") page?: string) {
    requireRoles(actor, ["SUPER_ADMIN"]);
    return listAdminClinics(this.prisma, page);
  }

  @Get("clinics/:clinicId/patients")
  @Roles("ADMIN")
  async patients(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string, @Query("page") page?: string) {
    requireClinicAdmin(actor, clinicId);
    return listClinicPatients(this.prisma, clinicId, page);
  }

  @Post("clinics/:clinicId/visits")
  @Roles("ADMIN")
  async bookVisit(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string, @Body() body: unknown): Promise<{ id: string }> {
    requireClinicAdmin(actor, clinicId);
    await this.limits.consume(`booking:${actor.id}`, 30, BOOKING_WINDOW_MS);
    return bookDeskVisit(this.prisma, this.notices, actor, clinicId, body);
  }

  @Get("clinics/:clinicId/patients/:patientId")
  @Roles("ADMIN")
  async card(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("patientId") patientId: string,
  ) {
    requireClinicAdmin(actor, clinicId);
    const appointments = await this.prisma.appointment.findMany({
      where: { clinicId, patientId },
      orderBy: { startsAt: "desc" },
      select: {
        id: true,
        startsAt: true,
        status: true,
        priceAmd: true,
        isEstimate: true,
        offering: { select: { name: true } },
        events: { orderBy: { createdAt: "asc" }, select: eventSelect },
      },
    });
    if (appointments.length === 0) throw new AppError("NOT_FOUND", 404, "Պացիենտը չի գտնվել");
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, displayName: true, email: true, phone: true },
    });
    const histories = await namedEventsForVisits(this.prisma, appointments);
    return {
      patient,
      appointments: appointments.map((row, index) => ({
        ...omitEvents(row),
        events: histories[index] ?? [],
      })),
    };
  }

  @Get("clinics/:clinicId/finance")
  @Roles("ADMIN")
  async finance(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    requireClinicAdmin(actor, clinicId);
    const clinic = await this.prisma.clinic.findUnique({ where: { id: clinicId }, select: { timeZone: true } });
    if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
    const window = financeWindow(from, to, clinic.timeZone);
    const rows = await this.prisma.appointment.groupBy({
      by: ["status"],
      where: {
        clinicId,
        isEstimate: false,
        status: { in: ["REQUESTED", "CONFIRMED", "COMPLETED"] },
        ...(window ? { startsAt: window } : {}),
      },
      _sum: { priceAmd: true },
    });
    const totals = { REQUESTED: 0, CONFIRMED: 0, COMPLETED: 0 };
    for (const row of rows) {
      if (row.status === "REQUESTED" || row.status === "CONFIRMED" || row.status === "COMPLETED") {
        totals[row.status] = row._sum.priceAmd ?? 0;
      }
    }
    return totals;
  }

  @Get("clinics/:clinicId/reviews")
  @Roles("ADMIN")
  reviews(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string): never[] {
    requireClinicAdmin(actor, clinicId);
    return [];
  }

  @Get("me/notifications")
  async notifications(@CurrentActor() actor: Actor, @Query("limit") limit?: string, @Query("cursor") cursor?: string) {
    const pageLimit = readNoticeLimit(limit);
    const pageCursor = readNoticeCursor(cursor);
    if (actor.role === "SUPER_ADMIN") return emptyNoticePage();
    return listUserNotices(this.prisma, actor.id, pageLimit, pageCursor);
  }

  @Post("me/notifications/read")
  async readNotifications(@CurrentActor() actor: Actor): Promise<{ ok: true }> {
    if (actor.role === "SUPER_ADMIN") return { ok: true };
    await this.prisma.notification.updateMany({
      where: { userId: actor.id, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  @Delete("me/notifications")
  async deleteNotifications(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ deleted: number }> {
    if (actor.role === "SUPER_ADMIN") return { deleted: 0 };
    const result = await this.prisma.notification.deleteMany({
      where: { userId: actor.id, id: { in: readNoticeIds(body) } },
    });
    return { deleted: result.count };
  }

  @Delete("me/notifications/read")
  async deleteReadNotifications(@CurrentActor() actor: Actor): Promise<{ deleted: number }> {
    if (actor.role === "SUPER_ADMIN") return { deleted: 0 };
    const result = await this.prisma.notification.deleteMany({
      where: { userId: actor.id, readAt: { not: null } },
    });
    return { deleted: result.count };
  }
}
