import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { AppError } from "../common/app-error";
import { createDatabasePool } from "../infrastructure/database-pool";
import { withOpenSlot } from "./book-slot";

const fixturePrefix = "race-fixture ";

type Fixture = {
  prisma: PrismaClient;
  clinicId: string;
  doctorId: string;
  offeringId: string;
};

async function main(): Promise<void> {
  const url = readDatabaseUrl();
  if (!url) {
    process.stdout.write("skip withOpenSlot concurrency: DATABASE_URL is not set\n");
    return;
  }
  const fixture = await openFixture(url);
  try {
    await expectRace(
      fixture,
      new Date("2035-06-15T10:00:00.000Z"),
      new Date("2035-06-15T10:30:00.000Z"),
      new Date("2035-06-15T10:00:00.000Z"),
      new Date("2035-06-15T10:30:00.000Z"),
    );
    await expectRace(
      fixture,
      new Date("2035-06-16T10:00:00.000Z"),
      new Date("2035-06-16T10:45:00.000Z"),
      new Date("2035-06-16T10:30:00.000Z"),
      new Date("2035-06-16T11:15:00.000Z"),
    );
    process.stdout.write("withOpenSlot concurrency: ok\n");
  } finally {
    await wipeRaceClinics(fixture.prisma);
    await fixture.prisma.$disconnect();
  }
}

async function expectRace(
  fixture: Fixture,
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date,
): Promise<void> {
  const results = await Promise.allSettled([
    holdSlot(fixture, firstStart, firstEnd),
    holdSlot(fixture, secondStart, secondEnd),
  ]);
  const won = results.filter((item) => item.status === "fulfilled");
  const lost = results.find((item): item is PromiseRejectedResult => item.status === "rejected");
  assert.equal(won.length, 1);
  assert.ok(lost);
  if (!(lost.reason instanceof AppError)) {
    throw new Error(raceDetail(lost.reason));
  }
  assert.equal(lost.reason.code, "SLOT_UNAVAILABLE");
  assert.equal(lost.reason.status, 409);
  const spanEnd = firstEnd > secondEnd ? firstEnd : secondEnd;
  const spanStart = firstStart < secondStart ? firstStart : secondStart;
  const open = await fixture.prisma.appointment.count({
    where: {
      doctorId: fixture.doctorId,
      status: { in: ["REQUESTED", "CONFIRMED"] },
      startsAt: { lt: spanEnd },
      endsAt: { gt: spanStart },
    },
  });
  assert.equal(open, 1);
}

async function holdSlot(fixture: Fixture, startsAt: Date, endsAt: Date): Promise<{ id: string }> {
  return withOpenSlot(fixture.prisma, fixture.doctorId, startsAt, endsAt, undefined, (tx) =>
    tx.appointment.create({
      data: {
        doctorId: fixture.doctorId,
        clinicId: fixture.clinicId,
        offeringId: fixture.offeringId,
        startsAt,
        endsAt,
        priceAmd: 5000,
        isEstimate: false,
        status: "REQUESTED",
        guestName: "Race",
        guestPhone: "+37441000000",
      },
      select: { id: true },
    }),
  );
}

async function openFixture(url: string): Promise<Fixture> {
  const prisma = new PrismaClient({ adapter: new PrismaPg(createDatabasePool(url), { disposeExternalPool: true }) });
  await wipeRaceClinics(prisma);
  const mark = `${fixturePrefix}${randomBytes(4).toString("hex")}`;
  const owner = await prisma.user.create({
    data: { email: `${slug(mark)}-admin@hippocrates.test`, passwordHash: "test", displayName: mark, role: "ADMIN" },
  });
  const clinic = await prisma.clinic.create({ data: { name: mark, ownerId: owner.id, published: false } });
  const doctorUser = await prisma.user.create({
    data: {
      email: `${slug(mark)}-doctor@hippocrates.test`,
      passwordHash: "test",
      displayName: mark,
      role: "DOCTOR",
      clinicId: clinic.id,
    },
  });
  const doctor = await prisma.doctorProfile.create({
    data: { userId: doctorUser.id, clinicId: clinic.id, specialty: "Test", published: false },
  });
  const offering = await prisma.serviceOffering.create({
    data: {
      clinicId: clinic.id,
      doctorId: doctor.id,
      name: "Race slot",
      priceAmd: 5000,
      durationMinutes: 30,
      published: false,
    },
  });
  return { prisma, clinicId: clinic.id, doctorId: doctor.id, offeringId: offering.id };
}

async function wipeRaceClinics(prisma: PrismaClient): Promise<void> {
  const leftovers = await prisma.clinic.findMany({
    where: { name: { startsWith: fixturePrefix } },
    select: { id: true, ownerId: true, doctors: { select: { userId: true } } },
  });
  for (const clinic of leftovers) {
    await prisma.notification.deleteMany({ where: { appointment: { clinicId: clinic.id } } });
    await prisma.appointment.deleteMany({ where: { clinicId: clinic.id } });
    await prisma.user.updateMany({ where: { clinicId: clinic.id }, data: { clinicId: null } });
    await prisma.clinic.delete({ where: { id: clinic.id } });
    await prisma.user.deleteMany({
      where: { id: { in: [clinic.ownerId, ...clinic.doctors.map((doctor) => doctor.userId)] } },
    });
  }
}

function slug(value: string): string {
  return value.replace(/\s+/g, "-").toLowerCase();
}

function raceDetail(reason: unknown): string {
  const name = reason instanceof Error ? reason.constructor.name : typeof reason;
  const code = reason && typeof reason === "object" && "code" in reason ? String(reason.code) : "";
  const text = reason instanceof Error ? reason.message.replace(/postgres(?:ql)?:\/\/\S+/gi, "[db]") : "";
  return `expected AppError, got ${name} ${code} ${text.slice(0, 240)}`;
}

function readDatabaseUrl(): string {
  const existing = process.env.DATABASE_URL?.trim() ?? "";
  if (existing) return existing;
  try {
    const text = readFileSync(path.resolve(__dirname, "../../../../.env"), "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (!line.startsWith("DATABASE_URL=")) continue;
      let value = line.slice("DATABASE_URL=".length).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  } catch {
    return "";
  }
  return "";
}

void main().catch((error: unknown) => {
  process.stderr.write(error instanceof Error ? `${error.stack ?? error.message}\n` : "concurrency test failed\n");
  process.exitCode = 1;
});
