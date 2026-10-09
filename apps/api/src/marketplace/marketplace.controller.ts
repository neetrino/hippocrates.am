import { Controller, Get, Param, Query } from "@nestjs/common";
import { applyClinic, applyDoctor, applyOfferingDoctor, applyReview, catalogLocale, type CatalogLocale } from "../catalog/locale-copy";
import { AppError } from "../common/app-error";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import { PrismaService } from "../infrastructure/prisma.service";
import { Public } from "../identity/auth.decorators";
import { clinicCopies, clinicNameSearch } from "./clinic-search";

const clinicFields = {
  id: true,
  name: true,
  address: true,
  district: true,
  phone: true,
  description: true,
  coverKey: true,
  logoKey: true,
} as const;

function clinicSelect(locale: CatalogLocale | null) {
  return {
    ...clinicFields,
    ...(locale
      ? { locales: { where: { locale }, select: { locale: true, name: true, district: true, address: true, description: true } } }
      : {}),
  };
}

function doctorSelect(locale: CatalogLocale | null) {
  return {
    id: true,
    specialty: true,
    bio: true,
    photoKey: true,
    user: { select: { displayName: true } },
    ...(locale ? { locales: { where: { locale }, select: { locale: true, name: true, specialty: true, bio: true } } } : {}),
    clinic: {
      select: {
        id: true,
        name: true,
        ...(locale ? { locales: { where: { locale }, select: { locale: true, name: true } } } : {}),
      },
    },
  };
}

type ClinicRow = {
  coverKey: string | null;
  logoKey: string | null;
  district: string;
};

type DoctorRow = { photoKey: string | null };

function clinicView<T extends ClinicRow>(clinic: T) {
  const { coverKey, logoKey, ...rest } = clinic;
  return { ...rest, coverUrl: publicAssetUrl(coverKey), logoUrl: publicAssetUrl(logoKey) };
}

function doctorView<T extends DoctorRow>(doctor: T) {
  const { photoKey, ...rest } = doctor;
  return { ...rest, photoUrl: publicAssetUrl(photoKey) };
}

function parseMultiQuery(value?: string | string[]): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value.flatMap((item) => item.split(",")) : value.split(",");
  return [...new Set(parts.map((item) => item.trim()).filter(Boolean))];
}

@Controller("public")
export class MarketplaceController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get("home")
  async home(@Query("locale") locale?: string) {
    const language = catalogLocale(locale);
    const [clinics, doctors] = await Promise.all([
      this.prisma.clinic.findMany({
        where: { published: true },
        orderBy: { name: "asc" },
        take: 12,
        select: clinicSelect(language),
      }),
      this.prisma.doctorProfile.findMany({
        where: { published: true, clinic: { published: true } },
        orderBy: { user: { displayName: "asc" } },
        take: 12,
        select: doctorSelect(language),
      }),
    ]);
    return {
      clinics: clinics.map((clinic) => clinicView(applyClinic(clinic, language))),
      doctors: doctors.map((doctor) => doctorView(applyDoctor(doctor, language))),
    };
  }

  @Public()
  @Get("clinics")
  async clinics(@Query("name") name?: string, @Query("locale") locale?: string) {
    const language = catalogLocale(locale);
    const needle = name?.trim();
    const rows = await this.prisma.clinic.findMany({
      where: {
        published: true,
        ...(needle ? { OR: clinicNameSearch(needle) } : {}),
      },
      orderBy: { name: "asc" },
      select: {
        ...clinicFields,
        locales: { select: { locale: true, name: true, district: true, address: true, description: true } },
      },
    });
    return rows.map((clinic) => ({
      ...clinicView(applyClinic(clinic, language)),
      copies: clinicCopies(clinic),
    }));
  }

  @Public()
  @Get("clinics/:id")
  async clinic(@Param("id") id: string, @Query("locale") locale?: string) {
    const language = catalogLocale(locale);
    const clinic = await this.prisma.clinic.findFirst({
      where: { id, published: true },
      select: {
        ...clinicSelect(language),
        branches: { select: { id: true, name: true, address: true } },
        doctors: { where: { published: true }, select: doctorSelect(language) },
        offerings: {
          where: { published: true },
          select: {
            id: true,
            name: true,
            priceAmd: true,
            isEstimate: true,
            durationMinutes: true,
            doctorId: true,
            doctor: {
              select: {
                user: { select: { displayName: true } },
                ...(language ? { locales: { where: { locale: language }, select: { name: true } } } : {}),
              },
            },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            rating: true,
            body: true,
            reply: true,
            createdAt: true,
            ...(language ? { locales: { where: { locale: language }, select: { body: true, reply: true } } } : {}),
          },
        },
      },
    });
    if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
    const view = clinicView(applyClinic(clinic, language));
    return {
      ...view,
      doctors: clinic.doctors.map((doctor) => doctorView(applyDoctor(doctor, language))),
      offerings: clinic.offerings.map((offering) => applyOfferingDoctor(offering)),
      reviews: clinic.reviews.map((review) => applyReview(review)),
    };
  }

  @Public()
  @Get("doctor-filters")
  async doctorFilters(@Query("locale") locale?: string) {
    const language = catalogLocale(locale);
    const [specialtyRows, clinicRows] = await Promise.all([
      this.prisma.doctorProfile.findMany({
        where: { published: true, clinic: { published: true } },
        orderBy: { specialty: "asc" },
        select: {
          specialty: true,
          ...(language ? { locales: { where: { locale: language }, select: { specialty: true } } } : {}),
        },
      }),
      this.prisma.clinic.findMany({
        where: { published: true },
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          district: true,
          ...(language ? { locales: { where: { locale: language }, select: { name: true, district: true } } } : {}),
        },
      }),
    ]);
    const specialtyLabels: Record<string, string> = {};
    for (const row of specialtyRows) {
      const label = row.locales?.[0]?.specialty.trim() ?? "";
      if (row.specialty && label && !specialtyLabels[row.specialty]) specialtyLabels[row.specialty] = label;
    }
    const cityLabels: Record<string, string> = {};
    for (const clinic of clinicRows) {
      const label = clinic.locales?.[0]?.district.trim() ?? "";
      const district = clinic.district.trim();
      if (district && label && !cityLabels[district]) cityLabels[district] = label;
    }
    const cities = [...new Set(clinicRows.map((clinic) => clinic.district.trim()).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "hy"),
    );
    return {
      specialties: [...new Set(specialtyRows.map((row) => row.specialty).filter(Boolean))],
      specialtyLabels,
      cities,
      cityLabels,
      clinics: clinicRows.map((clinic) => ({
        id: clinic.id,
        name: clinic.name,
        label: clinic.locales?.[0]?.name.trim() || clinic.name,
      })),
    };
  }

  @Public()
  @Get("doctors")
  async doctors(
    @Query("locale") locale?: string,
    @Query("name") name?: string,
    @Query("specialty") specialty?: string | string[],
    @Query("city") city?: string | string[],
    @Query("clinic") clinic?: string | string[],
  ) {
    const language = catalogLocale(locale);
    const specialties = parseMultiQuery(specialty);
    const cities = parseMultiQuery(city);
    const clinics = parseMultiQuery(clinic);

    const clinicFilter: {
      published: true;
      name?: { in: string[] };
      district?: { in: string[] };
    } = { published: true };
    if (clinics.length > 0) clinicFilter.name = { in: clinics };
    if (cities.length > 0) clinicFilter.district = { in: cities };

    const rows = await this.prisma.doctorProfile.findMany({
      where: {
        published: true,
        clinic: clinicFilter,
        specialty: specialties.length > 0 ? { in: specialties } : undefined,
        ...(name?.trim() ? { OR: doctorNameSearch(name.trim(), language) } : {}),
      },
      orderBy: { user: { displayName: "asc" } },
      select: doctorSelect(language),
    });
    return rows.map((doctor) => doctorView(applyDoctor(doctor, language)));
  }

  @Public()
  @Get("doctors/:id")
  async doctor(@Param("id") id: string, @Query("locale") locale?: string) {
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: { id, published: true, clinic: { published: true } },
      select: {
        ...doctorSelect(catalogLocale(locale)),
        offerings: {
          where: { published: true },
          select: { id: true, name: true, priceAmd: true, isEstimate: true, durationMinutes: true, doctorId: true },
        },
      },
    });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
    return doctorView(applyDoctor(doctor, catalogLocale(locale)));
  }
}

function doctorNameSearch(name: string, locale: CatalogLocale | null) {
  const contains = { contains: name, mode: "insensitive" as const };
  const official = { user: { displayName: contains } };
  if (!locale) return [official];
  return [official, { locales: { some: { locale, name: contains } } }];
}
