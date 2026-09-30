import { Controller, Get, Param, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { PrismaService } from "../infrastructure/prisma.service";
import { Public } from "../identity/auth.decorators";

const doctorCard = {
  id: true,
  specialty: true,
  bio: true,
  user: { select: { displayName: true } },
  clinic: { select: { id: true, name: true } },
} as const;

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
        select: { id: true, name: true, address: true, phone: true },
      }),
      this.prisma.doctorProfile.findMany({
        where: { published: true, clinic: { published: true } },
        orderBy: { user: { displayName: "asc" } },
        take: 12,
        select: doctorCard,
      }),
    ]);
    return { clinics, doctors };
  }

  @Public()
  @Get("clinics")
  async clinics(@Query("name") name?: string) {
    return this.prisma.clinic.findMany({
      where: {
        published: true,
        name: name ? { contains: name, mode: "insensitive" } : undefined,
      },
      orderBy: { name: "asc" },
      select: { id: true, name: true, address: true, phone: true, description: true },
    });
  }

  @Public()
  @Get("clinics/:id")
  async clinic(@Param("id") id: string) {
    const clinic = await this.prisma.clinic.findFirst({
      where: { id, published: true },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        phone: true,
        branches: { select: { id: true, name: true, address: true } },
        doctors: {
          where: { published: true },
          select: doctorCard,
        },
        offerings: {
          where: { published: true },
          select: { id: true, name: true, priceAmd: true, isEstimate: true, durationMinutes: true, doctorId: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { id: true, rating: true, body: true, reply: true, createdAt: true },
        },
      },
    });
    if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
    return clinic;
  }

  @Public()
  @Get("doctors")
  async doctors(@Query("name") name?: string, @Query("specialty") specialty?: string) {
    return this.prisma.doctorProfile.findMany({
      where: {
        published: true,
        clinic: { published: true },
        specialty: specialty ? { contains: specialty, mode: "insensitive" } : undefined,
        user: name ? { displayName: { contains: name, mode: "insensitive" } } : undefined,
      },
      orderBy: { user: { displayName: "asc" } },
      select: doctorCard,
    });
  }

  @Public()
  @Get("doctors/:id")
  async doctor(@Param("id") id: string) {
    const doctor = await this.prisma.doctorProfile.findFirst({
      where: { id, published: true, clinic: { published: true } },
      select: {
        ...doctorCard,
        offerings: {
          where: { published: true },
          select: { id: true, name: true, priceAmd: true, isEstimate: true, durationMinutes: true },
        },
      },
    });
    if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
    return doctor;
  }
}
