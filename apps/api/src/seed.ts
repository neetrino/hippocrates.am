import "reflect-metadata";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import * as argon2 from "argon2";
import { PrismaClient, type Role } from "./generated/prisma/client";
import { uploadImage } from "./infrastructure/r2.storage";
import { localToUtc } from "./scheduling/slots";
import {
  clinics,
  patientEmail,
  patientName,
  questions,
  scheduleWeekdays,
  scheduleWindow,
  type ClinicFixture,
  type DoctorFixture,
} from "./seed-fixtures";

type Db = PrismaClient;

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function asset(file: string): string {
  return path.join(__dirname, "seed-assets", file);
}

async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

async function upsertUser(
  prisma: Db,
  input: { email: string; displayName: string; role: Role; password: string; clinicId?: string },
): Promise<string> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing.id;
  const created = await prisma.user.create({
    data: {
      email,
      displayName: input.displayName,
      role: input.role,
      clinicId: input.clinicId,
      passwordHash: await hashPassword(input.password),
    },
  });
  return created.id;
}

async function ensureSuperAdmin(prisma: Db): Promise<void> {
  const email = requiredEnv("SUPER_ADMIN_EMAIL");
  const password = requiredEnv("SUPER_ADMIN_PASSWORD");
  if (password.length < 8) throw new Error("SUPER_ADMIN_PASSWORD must be at least 8 characters");
  await upsertUser(prisma, { email, displayName: "Super Admin", role: "SUPER_ADMIN", password });
}

async function upsertClinic(prisma: Db, ownerId: string, clinic: ClinicFixture): Promise<{ id: string; coverKey: string | null }> {
  const existing = await prisma.clinic.findFirst({ where: { ownerId } });
  if (existing) return existing;
  const created = await prisma.clinic.create({
    data: {
      name: clinic.name,
      description: clinic.description,
      address: clinic.address,
      phone: clinic.phone,
      district: clinic.district,
      ownerId,
      published: true,
    },
  });
  await prisma.user.update({ where: { id: ownerId }, data: { clinicId: created.id } });
  await prisma.branch.create({ data: { clinicId: created.id, name: "Հիմնական", address: clinic.address } });
  return created;
}

async function ensureImage(
  prisma: Db,
  kind: "clinic" | "doctor",
  id: string,
  file: string,
  current: string | null,
): Promise<void> {
  if (current) return;
  const key = kind === "clinic" ? `clinics/${id}/cover.webp` : `doctors/${id}/portrait.webp`;
  await uploadImage(key, asset(file));
  if (kind === "clinic") await prisma.clinic.update({ where: { id }, data: { coverKey: key } });
  else await prisma.doctorProfile.update({ where: { id }, data: { photoKey: key } });
}

async function ensureOfferings(prisma: Db, clinicId: string, doctorId: string, doctor: DoctorFixture): Promise<void> {
  const count = await prisma.serviceOffering.count({ where: { doctorId } });
  if (count > 0) return;
  await prisma.serviceOffering.createMany({
    data: doctor.offerings.map((item) => ({
      clinicId,
      doctorId,
      name: item.name,
      priceAmd: item.priceAmd,
      durationMinutes: item.durationMinutes,
      published: true,
    })),
  });
}

async function ensureWindows(prisma: Db, doctorId: string): Promise<void> {
  const count = await prisma.scheduleWindow.count({ where: { doctorId } });
  if (count > 0) return;
  await prisma.scheduleWindow.createMany({
    data: scheduleWeekdays.map((weekday) => ({ doctorId, weekday, ...scheduleWindow })),
  });
}

async function seedDoctor(prisma: Db, clinicId: string, doctor: DoctorFixture, password: string): Promise<void> {
  const userId = await upsertUser(prisma, {
    email: doctor.email,
    displayName: doctor.displayName,
    role: "DOCTOR",
    password,
    clinicId,
  });
  const profile = await prisma.doctorProfile.upsert({
    where: { userId },
    update: { specialty: doctor.specialty, bio: doctor.bio, published: true },
    create: { userId, clinicId, specialty: doctor.specialty, bio: doctor.bio, published: true },
  });
  await ensureImage(prisma, "doctor", profile.id, doctor.photoFile, profile.photoKey);
  await ensureOfferings(prisma, clinicId, profile.id, doctor);
  await ensureWindows(prisma, profile.id);
}

async function seedClinic(prisma: Db, clinic: ClinicFixture, password: string): Promise<void> {
  const ownerId = await upsertUser(prisma, {
    email: clinic.adminEmail,
    displayName: clinic.adminName,
    role: "ADMIN",
    password,
  });
  const row = await upsertClinic(prisma, ownerId, clinic);
  await ensureImage(prisma, "clinic", row.id, clinic.coverFile, row.coverKey);
  for (const doctor of clinic.doctors) await seedDoctor(prisma, row.id, doctor, password);
}

function lastMondayIso(): string {
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yerevan", year: "numeric", month: "2-digit", day: "2-digit" });
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Yerevan", weekday: "short" });
  for (let daysAgo = 1; daysAgo <= 8; daysAgo += 1) {
    const day = new Date(Date.now() - daysAgo * 24 * 60 * 60_000);
    if (weekday.format(day) === "Mon") return date.format(day);
  }
  return date.format(new Date());
}

async function seedVisit(prisma: Db, patientId: string): Promise<void> {
  const existing = await prisma.appointment.findFirst({ where: { patientId, idempotencyKey: "seed-completed" } });
  if (existing) return;
  const offering = await prisma.serviceOffering.findFirst({ where: { name: "Խորհրդատվություն" }, include: { doctor: true } });
  if (!offering) return;
  const startsAt = localToUtc(lastMondayIso(), 10 * 60, "Asia/Yerevan");
  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      doctorId: offering.doctorId,
      clinicId: offering.clinicId,
      offeringId: offering.id,
      startsAt,
      endsAt: new Date(startsAt.getTime() + offering.durationMinutes * 60_000),
      status: "COMPLETED",
      priceAmd: offering.priceAmd,
      isEstimate: false,
      idempotencyKey: "seed-completed",
    },
  });
  await prisma.review.create({
    data: {
      appointmentId: appointment.id,
      patientId,
      clinicId: offering.clinicId,
      doctorId: offering.doctorId,
      rating: 5,
      body: "Ընդունելությունը հանգիստ էր, ժամը պահեցին, և բացատրեցին հաջորդ քայլը։",
      reply: "Շնորհակալություն, սպասում ենք հաջորդ այցին։",
    },
  });
  await prisma.notification.create({
    data: { userId: patientId, appointmentId: appointment.id, body: "Այցն ավարտված է" },
  });
}

async function seedQuestions(prisma: Db, authorId: string): Promise<void> {
  for (const item of questions) {
    const existing = await prisma.question.findFirst({ where: { title: item.title, authorId } });
    if (existing) continue;
    const doctor = await prisma.doctorProfile.findFirst({ where: { user: { email: item.doctorEmail } } });
    if (!doctor) continue;
    const question = await prisma.question.create({
      data: { authorId, title: item.title, body: item.body, category: item.category, status: "PUBLISHED", clinicId: doctor.clinicId },
    });
    await prisma.answer.create({ data: { questionId: question.id, doctorId: doctor.id, body: item.answer, published: true } });
  }
}

async function seed(): Promise<void> {
  requiredEnv("R2_ACCESS_KEY_ID");
  requiredEnv("R2_SECRET_ACCESS_KEY");
  requiredEnv("R2_ENDPOINT");
  requiredEnv("R2_BUCKET");
  requiredEnv("R2_PUBLIC_URL");
  const password = requiredEnv("SEED_PASSWORD");
  if (password.length < 8) throw new Error("SEED_PASSWORD must be at least 8 characters");
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: requiredEnv("DATABASE_URL") }) });
  try {
    await ensureSuperAdmin(prisma);
    for (const clinic of clinics) await seedClinic(prisma, clinic, password);
    const patientId = await upsertUser(prisma, { email: patientEmail, displayName: patientName, role: "PATIENT", password });
    await seedVisit(prisma, patientId);
    await seedQuestions(prisma, patientId);
  } finally {
    await prisma.$disconnect();
  }
}

void seed();
