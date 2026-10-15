import type { NoticeKind } from "@/shared/notice-text";

export type NoticeWhen = "all" | "today" | "week" | "month";
export type NoticeKindFilter = "all" | NoticeKind;

export type NoticeFilters = {
  when: NoticeWhen;
  kind: NoticeKindFilter;
  person: string;
  unread: boolean;
};

export const emptyNoticeFilters: NoticeFilters = {
  when: "all",
  kind: "all",
  person: "",
  unread: false,
};

const yerevan = "Asia/Yerevan";
const dayMs = 86_400_000;

export function noticeFiltersActive(filters: NoticeFilters): boolean {
  return filters.when !== "all" || filters.kind !== "all" || filters.person !== "" || filters.unread;
}

export function matchesNoticeFilters(
  row: { startsAt: string | null; kind: NoticeKind; people: string[] },
  filters: NoticeFilters,
  unread: boolean,
): boolean {
  if (filters.unread && !unread) return false;
  if (filters.kind !== "all" && row.kind !== filters.kind) return false;
  if (filters.person !== "" && !row.people.includes(filters.person)) return false;
  return matchesWhen(row.startsAt, filters.when);
}

export function noticePersonNames(rows: { people: string[] }[]): string[] {
  const names = new Set<string>();
  for (const row of rows) {
    for (const name of row.people) {
      if (name) names.add(name);
    }
  }
  return [...names].sort((left, right) => left.localeCompare(right));
}

function matchesWhen(startsAt: string | null, when: NoticeWhen): boolean {
  if (when === "all") return true;
  if (!startsAt) return false;
  const now = new Date().toISOString();
  if (when === "today") return yerevanDay(startsAt) === yerevanDay(now);
  if (when === "week") return mondayUtc(startsAt) === mondayUtc(now);
  return yerevanDay(startsAt).slice(0, 7) === yerevanDay(now).slice(0, 7);
}

function yerevanDay(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: yerevan,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function mondayUtc(iso: string): number {
  const start = Date.parse(`${yerevanDay(iso)}T00:00:00Z`);
  const weekday = new Date(start).getUTCDay();
  const fromMonday = weekday === 0 ? 6 : weekday - 1;
  return start - fromMonday * dayMs;
}
