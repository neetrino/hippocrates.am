import { Body, Controller, Param, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { intOf, recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, requireRoles, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";

@Controller("reviews")
export class ReviewsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Roles("PATIENT")
  async create(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ id: string }> {
    requireRoles(actor, ["PATIENT"]);
    const input = recordOf(body);
    const appointmentId = requiredString(input.appointmentId, "Ամրագրում");
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, patientId: actor.id, status: "COMPLETED" },
    });
    if (!appointment) throw new AppError("NOT_FOUND", 404, "Ավարտված այց չի գտնվել");
    const existing = await this.prisma.review.findUnique({ where: { appointmentId } });
    if (existing) throw new AppError("REVIEW_EXISTS", 409, "Կարծիքն արդեն կա");
    const review = await this.prisma.review.create({
      data: {
        appointmentId,
        patientId: actor.id,
        clinicId: appointment.clinicId,
        doctorId: appointment.doctorId,
        rating: intOf(input.rating, "Գնահատական", 1, 5),
        body: requiredString(input.body, "Կարծիք"),
      },
    });
    return { id: review.id };
  }

  @Post(":id/reply")
  @Roles("ADMIN")
  async reply(@CurrentActor() actor: Actor, @Param("id") id: string, @Body() body: unknown): Promise<{ id: string }> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new AppError("NOT_FOUND", 404, "Կարծիքը չի գտնվել");
    requireClinicAdmin(actor, review.clinicId);
    await this.prisma.review.update({
      where: { id },
      data: { reply: requiredString(recordOf(body).reply, "Պատասխան") },
    });
    return { id };
  }
}
