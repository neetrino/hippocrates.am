const yerevan = "Asia/Yerevan";

const localeTag: Record<string, string> = {
  hy: "hy-AM",
  en: "en-GB",
  ru: "ru-RU",
};

const visitStatuses = ["REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
const roles = ["PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN"] as const;

export type VisitStatus = (typeof visitStatuses)[number];
export type AccountRole = (typeof roles)[number];

/** Grouped with en-GB so server and browser render the same digits. */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);
}

export function formatWhen(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(localeTag[locale] ?? "hy-AM", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: yerevan,
  }).format(new Date(iso));
}

/** Visit day in the active locale, Yerevan time, without the clock. */
export function formatVisitDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(localeTag[locale] ?? "hy-AM", {
    dateStyle: "medium",
    timeZone: yerevan,
  }).format(new Date(iso));
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: yerevan,
  }).format(new Date(iso));
}

export function asVisitStatus(value: string): VisitStatus | null {
  for (const status of visitStatuses) {
    if (status === value) return status;
  }
  return null;
}

export function asRole(value: string): AccountRole | null {
  for (const role of roles) {
    if (role === value) return role;
  }
  return null;
}
