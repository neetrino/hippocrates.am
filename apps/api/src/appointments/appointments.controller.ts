import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireRoles, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { NotificationsService } from "../notifications/notifications.service";
import { closeExpiredRequests } from "./close-expired";
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
} as const;

function presentAppointment<T extends { clinic: { coverKey: string | null } }>(row: T) {
  const { coverKey, ...clinic } = row.clinic;
  return { ...row, clinic: { ...clinic, coverUrl: publicAssetUrl(coverKey) } };
}

@Controller("appointments")
export class AppointmentsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notices: NotificationsService,
  ) {}

  @Post()
  @Roles("PATIENT")
  create(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ id: string }> {
    requireRoles(actor, ["PATIENT"]);
    return bookVisit(this.prisma, this.notices, actor.id, body);
  }

  @Post(":id/confirm")
  confirm(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    return confirmVisit(this.prisma, this.notices, actor, id);
  }

  @Post(":id/cancel")
  cancel(@CurrentActor() actor: Actor, @Param("id") id: string, @Body() body: unknown): Promise<{ id: string }> {
    return cancelVisit(this.prisma, this.notices, actor, id, body);
  }

  @Post(":id/complete")
  @Roles("ADMIN", "DOCTOR")
  complete(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    return completeVisit(this.prisma, this.notices, actor, id);
  }

  @Post(":id/no-show")
  @Roles("ADMIN", "DOCTOR")
  noShow(@CurrentActor() actor: Actor, @Param("id") id: string): Promise<{ id: string }> {
    return missVisit(this.prisma, this.notices, actor, id);
  }

  @Post(":id/reschedule")
  reschedule(@CurrentActor() actor: Actor, @Param("id") id: string, @Body() body: unknown): Promise<{ id: string }> {
    return rescheduleVisit(this.prisma, this.notices, actor, id, body);
  }

  @Get("mine")
  async mine(@CurrentActor() actor: Actor) {
    await closeExpiredRequests(this.prisma, this.notices);
    if (actor.role === "PATIENT") return this.listed({ patientId: actor.id }, "desc");
    if (actor.role === "DOCTOR") {
      const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: actor.id } });
      return doctor ? this.listed({ doctorId: doctor.id }, "asc") : [];
    }
    if (actor.role === "ADMIN" && actor.clinicId) return this.listed({ clinicId: actor.clinicId }, "asc");
    throw new AppError("FORBIDDEN", 403, "Այս գործողությունը թույլատրված չէ");
  }

  private async listed(where: { patientId: string } | { doctorId: string } | { clinicId: string }, direction: "asc" | "desc") {
    const rows = await this.prisma.appointment.findMany({ where, orderBy: { startsAt: direction }, select: appointmentCard });
    return rows.map(presentAppointment);
  }
}
