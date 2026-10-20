import * as argon2 from "argon2";
import type { PrismaClient, Role } from "../generated/prisma/client";
import { e2eAdminEmail, e2eClinicName, e2eDoctorEmail, e2eDoctorName, e2eOfferingName } from "./fixture-ids";
import { openLoopbackDb } from "./loopback-db";

const WEEKDAYS = [1, 2, 3, 4, 5];
const OPEN = { startMinute: 9 * 60, endMinute: 17 * 60 };

async function main(): Promise<void> {
  const password = process.env.SEED_PASSWORD?.trim() ?? "";
  const prisma = openLoopbackDb();
  try {
    const clinicId = await ensureClinic(prisma, password);
    const doctorId = await ensureDoctor(prisma, clinicId, password);
    await replaceHours(prisma, clinicId, doctorId);
  } finally {
    await prisma.$disconnect();
  }
}

async function ensureClinic(prisma: PrismaClient, password: string): Promise<string> {
  const ownerId = await ensureUser(prisma, {
    email: e2eAdminEmail,
    displayName: "E2E Admin",
    role: "ADMIN",
    password,
  });
  const existing = await prisma.clinic.findFirst({ where: { ownerId } });
  const clinic = existing
    ? await prisma.clinic.update({
        where: { id: existing.id },
        data: { name: e2eClinicName, published: true, verificationStatus: "APPROVED", timeZone: "Asia/Yerevan" },
      })
    : await prisma.clinic.create({
        data: {
          name: e2eClinicName,
          ownerId,
          published: true,
          verificationStatus: "APPROVED",
          timeZone: "Asia/Yerevan",
          district: "Kentron",
          address: "Abovyan 1, Yerevan",
        },
      });
  await prisma.user.update({ where: { id: ownerId }, data: { clinicId: clinic.id } });
  await writeClinicLocales(prisma, clinic.id);
  return clinic.id;
}

async function ensureDoctor(prisma: PrismaClient, clinicId: string, password: string): Promise<string> {
  const userId = await ensureUser(prisma, {
    email: e2eDoctorEmail,
    displayName: e2eDoctorName,
    role: "DOCTOR",
    password,
    clinicId,
  });
  const profile = await prisma.doctorProfile.upsert({
    where: { userId },
    update: { specialty: "Therapist", published: true, verificationStatus: "APPROVED", clinicId },
    create: { userId, clinicId, specialty: "Therapist", published: true, verificationStatus: "APPROVED" },
  });
  await writeDoctorLocales(prisma, profile.id);
  await ensureOffering(prisma, clinicId, profile.id);
  return profile.id;
}

async function ensureUser(
  prisma: PrismaClient,
  input: { email: string; displayName: string; role: Role; password: string; clinicId?: string },
): Promise<string> {
  const email = input.email.toLowerCase();
  const passwordHash = await argon2.hash(input.password, { type: argon2.argon2id });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const created = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName: input.displayName,
        role: input.role,
        clinicId: input.clinicId,
        emailVerifiedAt: new Date(),
      },
    });
    return created.id;
  }
  await prisma.user.update({
    where: { id: existing.id },
    data: {
      passwordHash,
      displayName: input.displayName,
      role: input.role,
      clinicId: input.clinicId ?? existing.clinicId,
      emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
    },
  });
  return existing.id;
}

async function ensureOffering(prisma: PrismaClient, clinicId: string, doctorId: string): Promise<void> {
  const existing = await prisma.serviceOffering.findFirst({ where: { doctorId, name: e2eOfferingName } });
  if (!existing) {
    await prisma.serviceOffering.create({
      data: { clinicId, doctorId, name: e2eOfferingName, priceAmd: 8000, durationMinutes: 30, published: true },
    });
    return;
  }
  await prisma.serviceOffering.update({
    where: { id: existing.id },
    data: { published: true, priceAmd: 8000, durationMinutes: 30 },
  });
}

async function writeClinicLocales(prisma: PrismaClient, clinicId: string): Promise<void> {
  for (const locale of ["en", "ru"]) {
    await prisma.clinicLocale.upsert({
      where: { clinicId_locale: { clinicId, locale } },
      create: { clinicId, locale, name: e2eClinicName, district: "Kentron", address: "Abovyan 1, Yerevan" },
      update: { name: e2eClinicName },
    });
  }
}

async function writeDoctorLocales(prisma: PrismaClient, doctorId: string): Promise<void> {
  for (const locale of ["en", "ru"]) {
    await prisma.doctorLocale.upsert({
      where: { doctorId_locale: { doctorId, locale } },
      create: { doctorId, locale, name: e2eDoctorName, specialty: "Therapist" },
      update: { name: e2eDoctorName, specialty: "Therapist" },
    });
  }
}

async function replaceHours(prisma: PrismaClient, clinicId: string, doctorId: string): Promise<void> {
  const hours = WEEKDAYS.map((weekday) => ({ weekday, ...OPEN }));
  await prisma.clinicWindow.deleteMany({ where: { clinicId } });
  await prisma.scheduleWindow.deleteMany({ where: { doctorId } });
  await prisma.clinicWindow.createMany({ data: hours.map((row) => ({ clinicId, ...row })) });
  await prisma.scheduleWindow.createMany({ data: hours.map((row) => ({ doctorId, ...row })) });
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "E2E fixture failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
