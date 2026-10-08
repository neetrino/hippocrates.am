import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from "@nestjs/common";
import { loadClinicLocales, localeCopies, saveClinicLocale, sourceClinicText } from "../catalog/clinic-locale-store";
import { deleteClinicRecord } from "./delete-clinic";
import { loadClinicOverview } from "./clinic-overview";
import { AppError } from "../common/app-error";
import { emailOf, optionalString, passwordOf, recordOf, requiredPhoneOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireClinicAdmin, requireRoles, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { SessionService } from "../identity/session.service";

@Controller()
export class ClinicsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
  ) {}

  @Post("clinics")
  @Roles("SUPER_ADMIN")
  async createClinic(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ clinicId: string }> {
    requireRoles(actor, ["SUPER_ADMIN"]);
    const input = recordOf(body);
    const email = emailOf(input.adminEmail);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("EMAIL_TAKEN", 409, "Այս էլ. փոստը արդեն գրանցված է");
    const text = sourceClinicText(input);
    const copies = localeCopies(input.locales);
    const passwordHash = await this.sessions.hashPassword(passwordOf(input.adminPassword));
    const phone = requiredPhoneOf(input.phone);
    const clinic = await this.prisma.$transaction(async (tx) => {
      const admin = await tx.user.create({
        data: {
          email,
          passwordHash,
          displayName: requiredString(input.adminName, "Ադմինի անուն"),
          role: "ADMIN",
        },
      });
      const created = await tx.clinic.create({
        data: { ...text, phone, ownerId: admin.id, published: true },
      });
      await tx.user.update({ where: { id: admin.id }, data: { clinicId: created.id } });
      await tx.branch.create({ data: { clinicId: created.id, name: "Հիմնական", address: text.address } });
      if (copies.length > 0) {
        await tx.clinicLocale.createMany({
          data: copies.map((item) => ({ clinicId: created.id, locale: item.locale, ...item.text })),
        });
      }
      return created;
    });
    return { clinicId: clinic.id };
  }

  @Get("clinics/:clinicId/profile")
  @Roles("ADMIN")
  async profile(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    const clinic = await this.prisma.clinic.findUnique({
      where: { id: clinicId },
      select: { id: true, name: true, description: true, address: true, phone: true, district: true },
    });
    if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
    return clinic;
  }

  @Patch("clinics/:clinicId")
  @Roles("ADMIN")
  async updateClinic(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Body() body: unknown,
  ): Promise<{ id: string }> {
    requireClinicAdmin(actor, clinicId);
    const input = recordOf(body);
    await this.prisma.clinic.update({
      where: { id: clinicId },
      data: {
        name: typeof input.name === "string" ? input.name.trim() : undefined,
        description: typeof input.description === "string" ? input.description.trim() : undefined,
        address: typeof input.address === "string" ? input.address.trim() : undefined,
        phone: typeof input.phone === "string" ? requiredPhoneOf(input.phone) : undefined,
        district: typeof input.district === "string" ? input.district.trim() : undefined,
        published: typeof input.published === "boolean" ? input.published : undefined,
      },
    });
    return { id: clinicId };
  }

  @Delete("clinics/:clinicId")
  @Roles("SUPER_ADMIN")
  async removeClinic(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string): Promise<{ id: string }> {
    requireRoles(actor, ["SUPER_ADMIN"]);
    await deleteClinicRecord(this.prisma, clinicId);
    return { id: clinicId };
  }

  @Get("clinics/:clinicId/overview")
  @Roles("SUPER_ADMIN")
  async overview(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireRoles(actor, ["SUPER_ADMIN"]);
    return loadClinicOverview(this.prisma, clinicId);
  }

  @Get("clinics/:clinicId/locales")
  @Roles("ADMIN")
  async locales(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    return loadClinicLocales(this.prisma, clinicId);
  }

  @Put("clinics/:clinicId/locales")
  @Roles("ADMIN")
  async saveLocales(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string, @Body() body: unknown) {
    requireClinicAdmin(actor, clinicId);
    return saveClinicLocale(this.prisma, clinicId, body);
  }

  @Post("clinics/:clinicId/branches")
  @Roles("ADMIN")
  async addBranch(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Body() body: unknown,
  ): Promise<{ id: string }> {
    requireClinicAdmin(actor, clinicId);
    const input = recordOf(body);
    const branch = await this.prisma.branch.create({
      data: {
        clinicId,
        name: requiredString(input.name, "Մասնաճյուղ"),
        address: optionalString(input.address),
      },
    });
    return { id: branch.id };
  }

  @Get("clinics/:clinicId/branches")
  @Roles("ADMIN")
  async listBranches(@CurrentActor() actor: Actor, @Param("clinicId") clinicId: string) {
    requireClinicAdmin(actor, clinicId);
    return this.prisma.branch.findMany({ where: { clinicId }, orderBy: { name: "asc" } });
  }
}
