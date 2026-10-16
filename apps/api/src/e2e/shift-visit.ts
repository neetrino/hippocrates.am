import { openLoopbackDb } from "./loopback-db";

const STARTED_MS = 60_000;

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase() ?? "";
  if (!email.endsWith("@hippocrates.test")) {
    throw new Error("E2E refused: shift only accepts a hippocrates.test patient.");
  }
  const prisma = openLoopbackDb();
  try {
    const patient = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!patient) throw new Error("E2E refused: patient was not found on the loopback database.");
    const visit = await prisma.appointment.findFirst({
      where: { patientId: patient.id, status: "CONFIRMED" },
      orderBy: { startsAt: "desc" },
      select: { id: true, offering: { select: { durationMinutes: true } } },
    });
    if (!visit) throw new Error("E2E refused: no confirmed visit to move.");
    const startsAt = new Date(Date.now() - STARTED_MS);
    const endsAt = new Date(startsAt.getTime() + visit.offering.durationMinutes * 60_000);
    await prisma.appointment.update({ where: { id: visit.id }, data: { startsAt, endsAt } });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "E2E shift failed";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
