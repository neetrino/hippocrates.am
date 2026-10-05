import { AppError } from "../common/app-error";
import { intOf, recordOf } from "../common/input";

export type StoredWindow = { weekday: number; startMinute: number; endMinute: number };

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
