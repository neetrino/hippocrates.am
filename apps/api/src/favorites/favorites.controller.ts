import { Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { applyClinic, applyDoctor, catalogLocale, type CatalogLocale, type ClinicLocaleRow, type DoctorLocaleRow } from "../catalog/locale-copy";
import { AppError } from "../common/app-error";
import { Prisma } from "../generated/prisma/client";
import type { Actor } from "../identity/access";
import { Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";
import { RateLimitService } from "../identity/rate-limit.service";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import { PrismaService } from "../infrastructure/prisma.service";
import { liveDoctor, liveListing } from "../catalog/public-visible";

const windowMs = 10 * 60 * 1000;

function localeSelect(locale: CatalogLocale | null) {
  return locale
    ? { locales: { where: { locale }, select: { locale: true, name: true, district: true, address: true, description: true } } }
    : {};
}

function clinicSelect(locale: CatalogLocale | null) {
  return {
    id: true,
    published: true,
    verificationStatus: true,
    name: true,
    address: true,
    district: true,
    phone: true,
    description: true,
    coverKey: true,
    logoKey: true,
    ...localeSelect(locale),
  };
}

function doctorSelect(locale: CatalogLocale | null) {
  return {
    id: true,
    published: true,
    verificationStatus: true,
    specialty: true,
    bio: true,
    photoKey: true,
    user: { select: { displayName: true } },
    ...(locale ? { locales: { where: { locale }, select: { locale: true, name: true, specialty: true, bio: true } } } : {}),
    clinic: {
      select: {
        id: true,
        published: true,
        verificationStatus: true,
        name: true,
        ...(locale ? { locales: { where: { locale }, select: { locale: true, name: true } } } : {}),
      },
    },
  };
}

type StoredClinic = {
  id: string;
  published: boolean;
  verificationStatus: string;
  name: string;
  address: string;
  district: string;
  phone: string;
  description: string;
  coverKey: string | null;
  logoKey: string | null;
  locales?: ClinicLocaleRow[];
};

type StoredDoctor = {
  id: string;
  published: boolean;
  verificationStatus: string;
  specialty: string;
  bio: string;
  photoKey: string | null;
  user: { displayName: string };
  locales?: DoctorLocaleRow[];
  clinic: { id: string; published: boolean; verificationStatus: string; name: string; locales?: { locale: string; name: string }[] };
};

function clinicCard(clinic: StoredClinic | null, locale: CatalogLocale | null) {
  if (!clinic) return null;
  const { published, verificationStatus, coverKey, logoKey, ...rest } = clinic;
  if (!published || verificationStatus !== "APPROVED") return null;
  return { ...applyClinic(rest, locale), coverUrl: publicAssetUrl(coverKey), logoUrl: publicAssetUrl(logoKey) };
}

function doctorCard(doctor: StoredDoctor | null, locale: CatalogLocale | null) {
  if (!doctor) return null;
  const { published, verificationStatus, photoKey, clinic, ...rest } = doctor;
  const { published: clinicLive, verificationStatus: clinicStatus, ...clinicRest } = clinic;
  if (!published || verificationStatus !== "APPROVED" || !clinicLive || clinicStatus !== "APPROVED") return null;
  const applied = applyDoctor({ ...rest, clinic: clinicRest }, locale);
  return { ...applied, photoUrl: publicAssetUrl(photoKey) };
}

function kept<T>(value: T | null): T[] {
  return value ? [value] : [];
}

function isDuplicate(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

@Controller("favorites")
@Roles("PATIENT")
export class FavoritesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly limits: RateLimitService,
  ) {}

  @Get()
  async list(@CurrentActor() actor: Actor, @Query("locale") locale?: string) {
    const language = catalogLocale(locale);
    const rows = await this.prisma.favorite.findMany({
      where: { userId: actor.id },
      orderBy: { createdAt: "desc" },
      select: {
        clinic: { select: clinicSelect(language) },
        doctor: { select: doctorSelect(language) },
      },
    });
    return {
      clinics: rows.flatMap((row) => kept(clinicCard(row.clinic, language))),
      doctors: rows.flatMap((row) => kept(doctorCard(row.doctor, language))),
    };
  }

  @Post("clinics/:id")
  async saveClinic(@CurrentActor() actor: Actor, @Param("id") id: string) {
    this.limits.consume(`favorite:${actor.id}`, 40, windowMs);
    await this.requireClinic(id);
    await this.remember({ userId: actor.id, clinicId: id });
    return { saved: true };
  }

  @Delete("clinics/:id")
  async dropClinic(@CurrentActor() actor: Actor, @Param("id") id: string) {
    this.limits.consume(`favorite:${actor.id}`, 40, windowMs);
    await this.prisma.favorite.deleteMany({ where: { userId: actor.id, clinicId: id } });
    return { saved: false };
  }

  @Post("doctors/:id")
  async saveDoctor(@CurrentActor() actor: Actor, @Param("id") id: string) {
    this.limits.consume(`favorite:${actor.id}`, 40, windowMs);
    await this.requireDoctor(id);
    await this.remember({ userId: actor.id, doctorId: id });
    return { saved: true };
  }

  @Delete("doctors/:id")
  async dropDoctor(@CurrentActor() actor: Actor, @Param("id") id: string) {
    this.limits.consume(`favorite:${actor.id}`, 40, windowMs);
    await this.prisma.favorite.deleteMany({ where: { userId: actor.id, doctorId: id } });
    return { saved: false };
  }

  private async requireClinic(id: string): Promise<void> {
    const clinic = await this.prisma.clinic.findFirst({ where: { id, ...liveListing }, select: { id: true } });
    if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
  }

  private async requireDoctor(id: string): Promise<void> {
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: { id, ...liveDoctor },
      select: { id: true },
    });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
  }

  private async remember(data: { userId: string; clinicId: string } | { userId: string; doctorId: string }): Promise<void> {
    try {
      await this.prisma.favorite.create({ data });
    } catch (error) {
      if (!isDuplicate(error)) throw error;
    }
  }
}
