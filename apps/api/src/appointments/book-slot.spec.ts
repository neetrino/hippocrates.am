import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { AppError } from "../common/app-error";
import { createDatabasePool } from "../infrastructure/database-pool";
import { withOpenSlot } from "./book-slot";

const fixturePrefix = "race-fixture ";
const databaseUrl = readDatabaseUrl();
const describeDb = databaseUrl ? describe : describe.skip;

type Fixture = {
  prisma: PrismaClient;
  clinicId: string;
  doctorId: string;
  offeringId: string;
};

describeDb("withOpenSlot concurrency", () => {
  let fixture: Fixture;

  beforeAll(async () => {
    fixture = await openFixture(databaseUrl);
  }, 30_000);

  afterAll(async () => {
    if (!fixture) return;
    await wipeRaceClinics(fixture.prisma);
    await fixture.prisma.$disconnect();
  });

  it("keeps one open visit when two writes share the start", async () => {
    await expectRace(
      fixture,
      new Date("2035-06-15T10:00:00.000Z"),
      new Date("2035-06-15T10:30:00.000Z"),
      new Date("2035-06-15T10:00:00.000Z"),
      new Date("2035-06-15T10:30:00.000Z"),
    );
  });

  it("keeps one open visit when two writes overlap at different starts", async () => {
    await expectRace(
      fixture,
      new Date("2035-06-16T10:00:00.000Z"),
      new Date("2035-06-16T10:45:00.000Z"),
      new Date("2035-06-16T10:30:00.000Z"),
      new Date("2035-06-16T11:15:00.000Z"),
    );
  });
});

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
  expect(won).toHaveLength(1);
  expect(lost).toBeDefined();
  expect(lost?.reason).toBeInstanceOf(AppError);
  expect(lost?.reason).toMatchObject({ code: "SLOT_UNAVAILABLE", status: 409 });
  const open = await fixture.prisma.appointment.count({
    where: {
      doctorId: fixture.doctorId,
      status: { in: ["REQUESTED", "CONFIRMED"] },
      startsAt: { lt: firstEnd > secondEnd ? firstEnd : secondEnd },
      endsAt: { gt: firstStart < secondStart ? firstStart : secondStart },
    },
  });
  expect(open).toBe(1);
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
  const clinic = await prisma.clinic.create({
    data: { name: mark, ownerId: owner.id, published: false },
  });
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
