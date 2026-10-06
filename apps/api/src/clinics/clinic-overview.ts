import { AppError } from "../common/app-error";
import { Prisma } from "../generated/prisma/client";
import { publicAssetUrl } from "../infrastructure/r2.storage";
import type { PrismaService } from "../infrastructure/prisma.service";

const copyLocales = ["hy", "en", "ru"] as const;

type CopyLocale = (typeof copyLocales)[number];

type StoredCopy = {
  name: string;
  district: string;
  address: string;
  description: string;
};

const emptyCopy: StoredCopy = { name: "", district: "", address: "", description: "" };

const overviewSelect = {
  id: true,
  name: true,
  district: true,
  address: true,
  phone: true,
  description: true,
  coverKey: true,
  owner: { select: { displayName: true, email: true } },
  locales: { select: { locale: true, name: true, district: true, address: true, description: true } },
  branches: { orderBy: { name: "asc" }, select: { id: true, name: true, address: true } },
  doctors: {
    orderBy: { user: { displayName: "asc" } },
    select: { id: true, specialty: true, published: true, user: { select: { displayName: true } } },
  },
  offerings: {
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      priceAmd: true,
      isEstimate: true,
      durationMinutes: true,
      doctor: { select: { user: { select: { displayName: true } } } },
    },
  },
  reviews: {
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, rating: true, body: true, reply: true, createdAt: true },
  },
  _count: { select: { reviews: true } },
} as const;

type OverviewRow = Prisma.ClinicGetPayload<{ select: typeof overviewSelect }>;

function storedCopy(locale: CopyLocale, clinic: StoredCopy, rows: (StoredCopy & { locale: string })[]): StoredCopy {
  if (locale === "hy") return { name: clinic.name, district: clinic.district, address: clinic.address, description: clinic.description };
  const row = rows.find((item) => item.locale === locale);
  return row ? { name: row.name, district: row.district, address: row.address, description: row.description } : emptyCopy;
}

function toOverview(clinic: OverviewRow) {
  return {
    id: clinic.id,
    phone: clinic.phone,
    coverUrl: publicAssetUrl(clinic.coverKey),
    admin: clinic.owner,
    copies: copyLocales.map((locale) => ({ locale, ...storedCopy(locale, clinic, clinic.locales) })),
    branches: clinic.branches,
    doctors: clinic.doctors.map((doctor) => ({
      id: doctor.id,
      displayName: doctor.user.displayName,
      specialty: doctor.specialty,
      published: doctor.published,
    })),
    offerings: clinic.offerings.map((item) => ({
      id: item.id,
      name: item.name,
      priceAmd: item.priceAmd,
      isEstimate: item.isEstimate,
      durationMinutes: item.durationMinutes,
      doctorName: item.doctor.user.displayName,
    })),
    reviews: clinic.reviews.map((review) => ({ ...review, createdAt: review.createdAt.toISOString() })),
    reviewCount: clinic._count.reviews,
  };
}

/** Full clinic record for Super Admin. Empty translations stay empty. */
export async function loadClinicOverview(prisma: PrismaService, clinicId: string) {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: overviewSelect });
  if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
  return toOverview(clinic);
}
