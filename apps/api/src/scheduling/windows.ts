import { AppError } from "../common/app-error";
import { intOf, recordOf } from "../common/input";

export type StoredWindow = { weekday: number; startMinute: number; endMinute: number };

/** Drops or shortens doctor hours that sit outside the clinic week. Empty clinic leaves the doctor as-is. */
export function clipToClinic(clinic: StoredWindow[], doctor: StoredWindow[]): StoredWindow[] {
  if (clinic.length === 0) return doctor;
  const next: StoredWindow[] = [];
  for (const window of doctor) {
    const bound = clinic.find((item) => item.weekday === window.weekday);
    if (!bound) continue;
    const startMinute = Math.max(window.startMinute, bound.startMinute);
    const endMinute = Math.min(window.endMinute, bound.endMinute);
    if (startMinute < endMinute) next.push({ weekday: window.weekday, startMinute, endMinute });
  }
  return next;
}

/** Rejects a doctor week that is not fully inside the clinic week. */
export function assertInsideClinic(clinic: StoredWindow[], doctor: StoredWindow[]): void {
  if (clinic.length === 0) return;
  const ok = doctor.every((window) =>
    clinic.some(
      (bound) =>
        bound.weekday === window.weekday &&
        window.startMinute >= bound.startMinute &&
        window.endMinute <= bound.endMinute,
    ),
  );
  if (!ok) throw new AppError("VALIDATION_FAILED", 400, "Ժամը կլինիկայի աշխատանքային ժամերից դուրս է");
}

/** Weekly windows from an admin save. An empty list clears the schedule. */
export function windowsFrom(body: unknown): StoredWindow[] {
  const input = recordOf(body);
  const windows = Array.isArray(input.windows) ? input.windows : [];
  const seen = new Set<number>();
  return windows.map((item) => windowFrom(recordOf(item), seen));
}

function windowFrom(row: Record<string, unknown>, seen: Set<number>): StoredWindow {
  const weekday = intOf(row.weekday, "Օր", 0, 6);
  const startMinute = intOf(row.startMinute, "Սկիզբ", 0, 24 * 60 - 1);
  const endMinute = intOf(row.endMinute, "Վերջ", 1, 24 * 60);
  if (seen.has(weekday) || endMinute <= startMinute) {
    throw new AppError("VALIDATION_FAILED", 400, "Աշխատանքային ժամը սխալ է");
  }
  seen.add(weekday);
  return { weekday, startMinute, endMinute };
}
