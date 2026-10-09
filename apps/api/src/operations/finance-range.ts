import { AppError } from "../common/app-error";
import { dayBounds } from "../scheduling/day-off";

/** Clinic-local inclusive date range. Missing both ends means the full history. */
export function financeWindow(
  from: string | undefined,
  to: string | undefined,
  timeZone: string,
): { gte: Date; lt: Date } | undefined {
  const start = from?.trim() ?? "";
  const end = to?.trim() ?? "";
  if (!start && !end) return undefined;
  if (!start || !end) throw new AppError("VALIDATION_FAILED", 400, "Ընտրեք սկիզբը և վերջը");
  const first = dayBounds(start, timeZone);
  const last = dayBounds(end, timeZone);
  if (first.startsAt >= last.endsAt) throw new AppError("VALIDATION_FAILED", 400, "Ընտրեք սկիզբը և վերջը");
  return { gte: first.startsAt, lt: last.endsAt };
}
