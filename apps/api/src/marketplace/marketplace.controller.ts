import { Controller, Get, Param, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import { PrismaService } from "../infrastructure/prisma.service";
import { Public } from "../identity/auth.decorators";

const doctorSelect = {
  id: true,
  specialty: true,
  bio: true,
  photoKey: true,
  user: { select: { displayName: true } },
  clinic: { select: { id: true, name: true } },
} as const;

const clinicSelect = {
  id: true,
  name: true,
  address: true,
  district: true,
  phone: true,
  description: true,
  coverKey: true,
  logoKey: true,
} as const;

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

@Controller("public")
export class MarketplaceController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get("home")
  async home() {
    const [clinics, doctors] = await Promise.all([
      this.prisma.clinic.findMany({
        where: { published: true },
        orderBy: { name: "asc" },
        take: 12,
        select: clinicSelect,
      }),
      this.prisma.doctorProfile.findMany({
        where: { published: true, clinic: { published: true } },
        orderBy: { user: { displayName: "asc" } },
        take: 12,
        select: doctorSelect,
      }),
    ]);
    return { clinics: clinics.map(clinicView), doctors: doctors.map(doctorView) };
  }

  @Public()
  @Get("clinics")
  async clinics(@Query("name") name?: string) {
    const rows = await this.prisma.clinic.findMany({
      where: {
        published: true,
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
      orderBy: { name: "asc" },
      select: clinicSelect,
    });
    return rows.map(clinicView);
  }

  @Public()
  @Get("clinics/:id")
  async clinic(@Param("id") id: string) {
    const clinic = await this.prisma.clinic.findFirst({
      where: { id, published: true },
      select: {
        ...clinicSelect,
        branches: { select: { id: true, name: true, address: true } },
        doctors: { where: { published: true }, select: doctorSelect },
        offerings: {
          where: { published: true },
          select: {
            id: true,
            name: true,
            priceAmd: true,
            isEstimate: true,
            durationMinutes: true,
            doctorId: true,
            doctor: { select: { user: { select: { displayName: true } } } },
          },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, rating: true, body: true, reply: true, createdAt: true },
        },
      },
    });
    if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
    return {
      ...clinicView(clinic),
      doctors: clinic.doctors.map(doctorView),
    };
  }

  @Public()
  @Get("doctors")
  async doctors(
    @Query("name") name?: string,
    @Query("specialty") specialty?: string,
    @Query("city") city?: string,
    @Query("clinic") clinic?: string,
  ) {
    const clinicFilter: {
      published: true;
      name?: { contains: string; mode: "insensitive" };
      OR?: Array<
        | { district: { contains: string; mode: "insensitive" } }
        | { address: { contains: string; mode: "insensitive" } }
      >;
    } = { published: true };
    if (clinic?.trim()) {
      clinicFilter.name = { contains: clinic.trim(), mode: "insensitive" };
    }
    if (city?.trim()) {
      const cityQuery = city.trim();
      clinicFilter.OR = [
        { district: { contains: cityQuery, mode: "insensitive" } },
        { address: { contains: cityQuery, mode: "insensitive" } },
      ];
    }

    const rows = await this.prisma.doctorProfile.findMany({
      where: {
        published: true,
        clinic: clinicFilter,
        specialty: specialty?.trim()
          ? { contains: specialty.trim(), mode: "insensitive" }
          : undefined,
        user: name?.trim()
          ? { displayName: { contains: name.trim(), mode: "insensitive" } }
          : undefined,
      },
      orderBy: { user: { displayName: "asc" } },
      select: doctorSelect,
    });
    return rows.map(doctorView);
  }

  @Public()
  @Get("doctors/:id")
  async doctor(@Param("id") id: string) {
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: { id, published: true, clinic: { published: true } },
      select: {
        ...doctorSelect,
        offerings: {
          where: { published: true },
          select: { id: true, name: true, priceAmd: true, isEstimate: true, durationMinutes: true, doctorId: true },
        },
      },
    });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
    return doctorView(doctor);
  }
}
