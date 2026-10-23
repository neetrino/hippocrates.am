import { portalName } from "./clinic-label";

const yerevan = "Asia/Yerevan";
const hyMonths = ["հնվ", "փտվ", "մրտ", "ապր", "մյս", "հնս", "հլս", "օգս", "սեպ", "հոկ", "նոյ", "դեկ"];

const localeTag: Record<string, string> = {
  hy: "hy-AM",
  en: "en-GB",
  ru: "ru-RU",
};

const visitStatuses = ["REQUESTED", "CONFIRMED", "CANCELLED", "COMPLETED", "EXPIRED", "NO_SHOW"] as const;
const roles = ["PATIENT", "DOCTOR", "ADMIN", "SUPER_ADMIN"] as const;

export type VisitStatus = (typeof visitStatuses)[number];
export type AccountRole = (typeof roles)[number];

/** Grouped with en-GB so server and browser render the same digits. */
export function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-GB", { maximumFractionDigits: 0 }).format(value);
}

export function formatWhen(iso: string, locale: string): string {
  if (locale === "hy") {
    const parts = yerevanParts(iso);
    return `${hyDate(parts)}, ${parts.hour}:${parts.minute}`;
  }
  return new Intl.DateTimeFormat(localeTag[locale] ?? "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: yerevan,
  }).format(new Date(iso));
}

/** Visit day in the active locale, Yerevan time, without the clock. */
export function formatVisitDate(iso: string, locale: string): string {
  if (locale === "hy") return hyDate(yerevanParts(iso));
  return new Intl.DateTimeFormat(localeTag[locale] ?? "en-GB", {
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

export function patientLabel(
  visit: { patient: { displayName: string } | null; guestName?: string | null },
  locale = "hy",
): string {
  return portalName(visit.patient?.displayName || visit.guestName || "", locale);
}

type YerevanParts = { day: string; month: string; year: string; hour: string; minute: string };

/** Armenian months are written out so Chrome, which has no hy-AM data, matches the server. */
function hyDate(parts: YerevanParts): string {
  const month = hyMonths[Number(parts.month) - 1] ?? parts.month;
  return `${Number(parts.day)} ${month}, ${parts.year} թ.`;
}

function yerevanParts(iso: string): YerevanParts {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: yerevan,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const pick = (type: string): string => parts.find((part) => part.type === type)?.value ?? "";
  return { day: pick("day"), month: pick("month"), year: pick("year"), hour: pick("hour"), minute: pick("minute") };
}
