import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { emailOf, optionalString, passwordOf, recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { SessionService } from "../identity/session.service";

@Controller()
export class DoctorsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  @Post("clinics/:clinicId/doctors")
  @Roles("ADMIN")
  async createDoctor(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Body() body: unknown,
  ): Promise<{ id: string }> {
    requireClinicAdmin(actor, clinicId);
    const input = recordOf(body);
    const email = emailOf(input.email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("EMAIL_TAKEN", 409, "Այս էլ. փոստը արդեն գրանցված է");
    const passwordHash = await this.sessions.hashPassword(passwordOf(input.password));
    const profile = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          displayName: requiredString(input.displayName, "Բժշկի անուն"),
          role: "DOCTOR",
          clinicId,
        },
      });
      return tx.doctorProfile.create({
        data: {
          userId: user.id,
          clinicId,
          specialty: requiredString(input.specialty, "Մասնագիտություն"),
          bio: optionalString(input.bio),
          published: true,
        },
      });
    });
    return { id: profile.id };
  }

  @Get("clinics/:clinicId/doctors")
  @Roles("ADMIN")
  async listDoctors(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    return this.prisma.doctorProfile.findMany({
      where: { clinicId },
      include: { user: { select: { displayName: true, email: true } } },
      orderBy: { specialty: "asc" },
    });
  }
}
