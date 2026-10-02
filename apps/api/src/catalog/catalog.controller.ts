import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { intOf, recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";

@Controller()
export class CatalogController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("clinics/:clinicId/offerings")
  @Roles("ADMIN")
  async create(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Body() body: unknown,
  ): Promise<{ id: string }> {
    requireClinicAdmin(actor, clinicId);
    const input = recordOf(body);
    const doctorId = requiredString(input.doctorId, "Բժիշկ");
    const doctor = await this.prisma.doctorProfile.findFirst({ where: { id: doctorId, clinicId } });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
    const offering = await this.prisma.serviceOffering.create({
      data: {
        clinicId,
        doctorId,
        name: requiredString(input.name, "Ծառայություն"),
        priceAmd: intOf(input.priceAmd, "Գին", 0, 100_000_000),
        durationMinutes: intOf(input.durationMinutes, "Տևողություն", 5, 24 * 60),
        isEstimate: input.isEstimate === true,
        published: true,
      },
    });
    return { id: offering.id };
  }

  @Get("clinics/:clinicId/offerings")
  @Roles("ADMIN")
  async list(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    return this.prisma.serviceOffering.findMany({ where: { clinicId }, orderBy: { name: "asc" } });
  }
}
