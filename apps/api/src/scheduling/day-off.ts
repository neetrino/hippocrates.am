import { AppError } from "../common/app-error";
import { localToUtc } from "./slots";

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** One clinic-local calendar day, from midnight to the next midnight. */
export function dayBounds(date: string, timeZone: string): { startsAt: Date; endsAt: Date } {
  if (!isoDate.test(date)) throw new AppError("VALIDATION_FAILED", 400, "Ամսաթիվը սխալ է");
  const [year, month, day] = date.split("-").map(Number) as [number, number, number];
  const next = new Date(Date.UTC(year, month - 1, day + 1)).toISOString().slice(0, 10);
  return { startsAt: localToUtc(date, 0, timeZone), endsAt: localToUtc(next, 0, timeZone) };
}
