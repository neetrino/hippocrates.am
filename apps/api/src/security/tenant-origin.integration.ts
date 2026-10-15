import { createHash, randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "../app.module";
import { deleteClinicRecord } from "../clinics/delete-clinic";
import { HttpExceptionFilter } from "../common/http.filter";
import { PrismaService } from "../infrastructure/prisma.service";
import { isolatedTestDatabaseUrl } from "../infrastructure/test-database-url";

const fixturePrefix = "security-fixture ";
const webOrigin = "http://localhost:3000";

type Fixture = {
  adminId: string;
  clinicAId: string;
  clinicBId: string;
  cookie: string;
};

async function main(): Promise<void> {
  const url = isolatedTestDatabaseUrl();
  if (!url) {
    process.stdout.write("skip tenant/origin integration: TEST_DATABASE_URL is not set\n");
    return;
  }
  process.env.DATABASE_URL = url;
  process.env.WEB_URL = webOrigin;
  const app = await openApplication();
  const prisma = app.get(PrismaService);
  try {
    const fixture = await createFixture(prisma);
    await verifyTenantIsolation(await app.getUrl(), fixture);
    await verifyOriginGuard(await app.getUrl(), fixture);
    await verifyClinicArchive(prisma, fixture);
    process.stdout.write("tenant/origin integration: ok\n");
  } finally {
    await cleanup(prisma);
    await app.close();
  }
}

async function verifyClinicArchive(prisma: PrismaService, fixture: Fixture): Promise<void> {
  await deleteClinicRecord(prisma, fixture.clinicAId);
  const [clinic, user, session] = await Promise.all([
    prisma.clinic.findUnique({ where: { id: fixture.clinicAId }, select: { archivedAt: true } }),
    prisma.user.findUnique({ where: { id: fixture.adminId }, select: { disabledAt: true } }),
    prisma.session.findFirst({ where: { userId: fixture.adminId }, select: { revokedAt: true } }),
  ]);
  assert.ok(clinic?.archivedAt);
  assert.ok(user?.disabledAt);
  assert.ok(session?.revokedAt);
}

async function openApplication() {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.use(cookieParser());
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(0, "127.0.0.1");
  return app;
}

async function createFixture(prisma: PrismaService): Promise<Fixture> {
  await cleanup(prisma);
  const mark = `${fixturePrefix}${randomBytes(4).toString("hex")}`;
  const first = await prisma.user.create({
    data: { email: `${slug(mark)}-a@test.local`, passwordHash: "test", displayName: mark, role: "ADMIN" },
  });
  const second = await prisma.user.create({
    data: { email: `${slug(mark)}-b@test.local`, passwordHash: "test", displayName: mark, role: "ADMIN" },
  });
  const clinicA = await prisma.clinic.create({
    data: { name: `${mark} A`, ownerId: first.id, published: false, verificationStatus: "DRAFT" },
  });
  const clinicB = await prisma.clinic.create({
    data: { name: `${mark} B`, ownerId: second.id, published: false, verificationStatus: "DRAFT" },
  });
  await prisma.user.update({ where: { id: first.id }, data: { clinicId: clinicA.id } });
  await prisma.user.update({ where: { id: second.id }, data: { clinicId: clinicB.id } });
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: {
      userId: first.id,
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 60_000),
    },
  });
  return {
    adminId: first.id,
    clinicAId: clinicA.id,
    clinicBId: clinicB.id,
    cookie: `hippocrates_session=${token}`,
  };
}

async function verifyTenantIsolation(baseUrl: string, fixture: Fixture): Promise<void> {
  const headers = { cookie: fixture.cookie };
  const own = await fetch(`${baseUrl}/api/v1/clinics/${fixture.clinicAId}/patients`, { headers });
  assert.equal(own.status, 200);
  const foreign = await fetch(`${baseUrl}/api/v1/clinics/${fixture.clinicBId}/patients`, { headers });
  assert.equal(foreign.status, 404);
}

async function verifyOriginGuard(baseUrl: string, fixture: Fixture): Promise<void> {
  const endpoint = `${baseUrl}/api/v1/me/notifications/read`;
  const denied = await fetch(endpoint, {
    method: "POST",
    headers: { cookie: fixture.cookie, origin: "https://attacker.test" },
  });
  assert.equal(denied.status, 403);
  const allowed = await fetch(endpoint, {
    method: "POST",
    headers: { cookie: fixture.cookie, origin: webOrigin },
  });
  assert.equal(allowed.status, 200);
}

async function cleanup(prisma: PrismaService): Promise<void> {
  const clinics = await prisma.clinic.findMany({
    where: { name: { startsWith: fixturePrefix } },
    select: { id: true, ownerId: true },
  });
  const clinicIds = clinics.map((clinic) => clinic.id);
  const ownerIds = clinics.map((clinic) => clinic.ownerId);
  if (clinicIds.length === 0) return;
  await prisma.user.updateMany({ where: { clinicId: { in: clinicIds } }, data: { clinicId: null } });
  await prisma.clinic.deleteMany({ where: { id: { in: clinicIds } } });
  await prisma.user.deleteMany({ where: { id: { in: ownerIds } } });
}

function slug(value: string): string {
  return value.replace(/\s+/g, "-").toLowerCase();
}

void main().catch((error: unknown) => {
  process.stderr.write(error instanceof Error ? `${error.stack ?? error.message}\n` : "security integration failed\n");
  process.exitCode = 1;
});
