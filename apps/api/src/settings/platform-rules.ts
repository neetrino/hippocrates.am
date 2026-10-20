export const PLATFORM_SETTING_ID = "platform";
export const BOOKING_DAY_MIN = 1;
export const BOOKING_DAY_MAX = 180;
export const NOTICE_MINUTE_MAX = 10_080;

export type PlatformRules = {
  patientRegistrationEnabled: boolean;
  bookingEnabled: boolean;
  maxBookingDays: number;
  minNoticeMinutes: number;
  cancelDeadlineMinutes: number;
  rescheduleDeadlineMinutes: number;
};

export type BookingVerdict = "ok" | "closed" | "too-far" | "too-soon";

export const platformDefaults: PlatformRules = {
  patientRegistrationEnabled: true,
  bookingEnabled: true,
  maxBookingDays: 60,
  minNoticeMinutes: 120,
  cancelDeadlineMinutes: 1440,
  rescheduleDeadlineMinutes: 1440,
};

export function clinicDay(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(instant);
}

export function addCalendarDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + days));
  return date.toISOString().slice(0, 10);
}

export function withinHorizon(isoDate: string, today: string, maxDays: number): boolean {
  return isoDate >= today && isoDate <= addCalendarDays(today, maxDays);
}

/** The patient may still cancel or reschedule while more than the deadline remains. */
export function patientChangeOpen(startsAt: Date, now: Date, deadlineMinutes: number): boolean {
  return startsAt.getTime() - now.getTime() > deadlineMinutes * 60_000;
}

export function patientBookingOpen(
  rules: PlatformRules,
  startsAt: Date,
  timeZone: string,
  now: Date,
): BookingVerdict {
  if (!rules.bookingEnabled) return "closed";
  const today = clinicDay(now, timeZone);
  const day = clinicDay(startsAt, timeZone);
  if (!withinHorizon(day, today, rules.maxBookingDays)) return "too-far";
  if (startsAt.getTime() < now.getTime() + rules.minNoticeMinutes * 60_000) return "too-soon";
  return "ok";
}

export function applyPatientSlots<T extends { startsAt: string; busy: boolean }>(
  slots: T[],
  rules: PlatformRules,
  isoDate: string,
  timeZone: string,
  now: Date,
): T[] {
  const open = rules.bookingEnabled && withinHorizon(isoDate, clinicDay(now, timeZone), rules.maxBookingDays);
  const earliest = now.getTime() + rules.minNoticeMinutes * 60_000;
  return slots.map((slot) => ({
    ...slot,
    busy: slot.busy || !open || new Date(slot.startsAt).getTime() < earliest,
  }));
}
