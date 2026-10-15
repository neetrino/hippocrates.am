import type { PrismaService } from "../infrastructure/prisma.service";

export type DeskPatient = {
  id: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
};

export async function listClinicPatients(prisma: PrismaService, clinicId: string): Promise<DeskPatient[]> {
  const [accounts, guests] = await Promise.all([
    prisma.appointment.findMany({
      where: { clinicId, patientId: { not: null } },
      distinct: ["patientId"],
      select: { patient: { select: { id: true, displayName: true, email: true, phone: true } } },
    }),
    prisma.appointment.findMany({
      where: { clinicId, patientId: null, guestPhone: { not: null } },
      orderBy: { startsAt: "desc" },
      select: { guestName: true, guestPhone: true },
    }),
  ]);
  return [...accountPatients(accounts), ...guestPatients(guests)];
}

export async function countClinicPatients(prisma: PrismaService, clinicId: string): Promise<number> {
  const [accounts, guests] = await Promise.all([
    prisma.appointment.findMany({
      where: { clinicId, patientId: { not: null } },
      distinct: ["patientId"],
      select: { patientId: true },
    }),
    prisma.appointment.findMany({
      where: { clinicId, patientId: null, guestPhone: { not: null } },
      distinct: ["guestPhone"],
      select: { guestPhone: true },
    }),
  ]);
  return accounts.length + guests.length;
}

function accountPatients(rows: { patient: DeskPatient | null }[]): DeskPatient[] {
  return rows.flatMap((row) => (row.patient ? [row.patient] : []));
}

function guestPatients(rows: { guestName: string | null; guestPhone: string | null }[]): DeskPatient[] {
  const seen = new Set<string>();
  const guests: DeskPatient[] = [];
  for (const row of rows) {
    if (!row.guestPhone || seen.has(row.guestPhone)) continue;
    seen.add(row.guestPhone);
    guests.push({ id: null, displayName: row.guestName ?? "", email: null, phone: row.guestPhone });
  }
  return guests;
}
