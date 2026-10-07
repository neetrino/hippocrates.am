import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { closeExpiredRequests } from "../appointments/close-expired";
import { readNoticeIds } from "../notifications/notice-ids";
import { NotificationsService } from "../notifications/notifications.service";

@Controller()
export class OperationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notices: NotificationsService,
  ) {}

  @Get("clinics/:clinicId/dashboard")
  @Roles("ADMIN")
  async dashboard(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    const now = new Date();
    await closeExpiredRequests(this.prisma, this.notices, now);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 60 * 60_000);
    const [pending, today, patients] = await Promise.all([
      this.prisma.appointment.count({ where: { clinicId, status: "REQUESTED", startsAt: { gt: now } } }),
      this.prisma.appointment.count({ where: { clinicId, startsAt: { gte: start, lt: end } } }),
      this.prisma.appointment.findMany({
        where: { clinicId },
        distinct: ["patientId"],
        select: { patientId: true },
      }),
    ]);
    return { pending, today, patientCount: patients.length };
  }

  @Get("clinics/:clinicId/patients")
  @Roles("ADMIN")
  async patients(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    const rows = await this.prisma.appointment.findMany({
      where: { clinicId },
      distinct: ["patientId"],
      select: { patient: { select: { id: true, displayName: true, email: true, phone: true } } },
    });
    return rows.map((row) => row.patient);
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
      },
    });
    if (appointments.length === 0) throw new AppError("NOT_FOUND", 404, "Պացիենտը չի գտնվել");
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, displayName: true, email: true, phone: true },
    });
    return { patient, appointments };
  }

  @Get("clinics/:clinicId/finance")
  @Roles("ADMIN")
  async finance(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    const rows = await this.prisma.appointment.groupBy({
      by: ["status"],
      where: { clinicId, isEstimate: false, status: { in: ["REQUESTED", "CONFIRMED", "COMPLETED"] } },
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

  @Get("me/notifications")
  async notifications(@CurrentActor() actor: Actor) {
    if (actor.role === "SUPER_ADMIN") return [];
    return this.prisma.notification.findMany({
      where: { userId: actor.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        body: true,
        createdAt: true,
        readAt: true,
        appointment: {
          select: {
            startsAt: true,
            clinic: { select: { name: true, locales: { select: { locale: true, name: true } } } },
            doctor: {
              select: {
                user: { select: { displayName: true } },
                locales: { select: { locale: true, name: true } },
              },
            },
          },
        },
      },
    });
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
