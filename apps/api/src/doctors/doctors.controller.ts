import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req } from "@nestjs/common";
import type { Request } from "express";
import { AppError } from "../common/app-error";
import { emailOf, optionalString, passwordOf, recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import { requireClinicAdmin, type Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { RateLimitService } from "../identity/rate-limit.service";
import { SessionService } from "../identity/session.service";
import { saveDoctorLocale, updateDoctor } from "./doctor-edit";
import { clearDoctorPhoto, saveDoctorPhoto } from "./doctor-photo";

@Controller()
export class DoctorsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
    private readonly limits: RateLimitService,
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
    const rows = await this.prisma.doctorProfile.findMany({
      where: { clinicId },
      orderBy: { specialty: "asc" },
      select: {
        id: true,
        specialty: true,
        bio: true,
        photoKey: true,
        user: { select: { displayName: true, email: true } },
        locales: { select: { locale: true, name: true, specialty: true, bio: true } },
      },
    });
    return rows.map((doctor) => ({
      id: doctor.id,
      specialty: doctor.specialty,
      bio: doctor.bio,
      photoUrl: publicAssetUrl(doctor.photoKey),
      user: doctor.user,
      locales: doctor.locales,
    }));
  }

  @Patch("clinics/:clinicId/doctors/:doctorId")
  @Roles("ADMIN")
  async editDoctor(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("doctorId") doctorId: string,
    @Body() body: unknown,
  ): Promise<{ id: string }> {
    requireClinicAdmin(actor, clinicId);
    return updateDoctor(this.prisma, clinicId, doctorId, body);
  }

  @Put("clinics/:clinicId/doctors/:doctorId/locales")
  @Roles("ADMIN")
  async editLocale(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("doctorId") doctorId: string,
    @Body() body: unknown,
  ): Promise<{ ok: true }> {
    requireClinicAdmin(actor, clinicId);
    return saveDoctorLocale(this.prisma, clinicId, doctorId, body);
  }

  @Post("clinics/:clinicId/doctors/:doctorId/photo")
  @Roles("ADMIN")
  async uploadPhoto(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("doctorId") doctorId: string,
    @Req() request: Request,
  ): Promise<{ photoUrl: string }> {
    requireClinicAdmin(actor, clinicId);
    this.limits.consume(`photo:${actor.id}`, 10, 10 * 60 * 1000);
    return { photoUrl: await saveDoctorPhoto(this.prisma, clinicId, doctorId, request) };
  }

  @Delete("clinics/:clinicId/doctors/:doctorId/photo")
  @Roles("ADMIN")
  async removePhoto(
    @CurrentActor() actor: Actor,
    @Param("clinicId") clinicId: string,
    @Param("doctorId") doctorId: string,
  ): Promise<{ ok: true }> {
    requireClinicAdmin(actor, clinicId);
    this.limits.consume(`photo:${actor.id}`, 10, 10 * 60 * 1000);
    await clearDoctorPhoto(this.prisma, clinicId, doctorId);
    return { ok: true };
  }
}
