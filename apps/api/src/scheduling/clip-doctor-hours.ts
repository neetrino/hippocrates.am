import type { Prisma } from "../generated/prisma/client";
import { clipToClinic, type StoredWindow } from "./windows";

/** After clinic hours change, stored doctor weeks stay inside that clinic week. */
export async function clipDoctorHours(
  tx: Prisma.TransactionClient,
  clinicId: string,
  clinic: StoredWindow[],
): Promise<void> {
  if (clinic.length === 0) return;
  const rows = await tx.scheduleWindow.findMany({
    where: { doctor: { clinicId } },
    select: { doctorId: true, weekday: true, startMinute: true, endMinute: true },
  });
  const byDoctor = groupDoctorWindows(rows);
  for (const [doctorId, windows] of byDoctor) {
    const next = clipToClinic(clinic, windows);
    await tx.scheduleWindow.deleteMany({ where: { doctorId } });
    if (next.length === 0) continue;
    await tx.scheduleWindow.createMany({ data: next.map((window) => ({ doctorId, ...window })) });
  }
}

function groupDoctorWindows(
  rows: { doctorId: string; weekday: number; startMinute: number; endMinute: number }[],
): Map<string, StoredWindow[]> {
  const byDoctor = new Map<string, StoredWindow[]>();
  for (const row of rows) {
    const list = byDoctor.get(row.doctorId) ?? [];
    list.push({ weekday: row.weekday, startMinute: row.startMinute, endMinute: row.endMinute });
    byDoctor.set(row.doctorId, list);
  }
  return byDoctor;
}
