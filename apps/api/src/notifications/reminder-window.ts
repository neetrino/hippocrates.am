export type ReminderKind = "day" | "hour";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

/** Day reminder is open until one hour before the visit. The hour reminder stays open until the start. */
export function dueReminder(startsAt: Date, now: Date, bookedAt: Date | null): ReminderKind | null {
  const start = startsAt.getTime();
  const time = now.getTime();
  if (time >= start || time < start - DAY_MS) return null;
  const booked = bookedAt?.getTime();
  if (time >= start - HOUR_MS) {
    if (booked !== undefined && booked > start - HOUR_MS) return null;
    return "hour";
  }
  if (booked !== undefined && booked > start - DAY_MS) return null;
  return "day";
}

export function reminderKey(appointmentId: string, userId: string, kind: ReminderKind, startsAt: Date): string {
  return `${appointmentId}:${userId}:${kind}:${startsAt.toISOString()}`;
}
