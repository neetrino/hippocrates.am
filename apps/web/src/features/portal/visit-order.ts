const active = new Set(["CONFIRMED", "REQUESTED"]);
const closed = new Set(["CANCELLED", "EXPIRED", "NO_SHOW"]);

/** How many visits stay visible before "More" in each section. */
export const visitPreviewLimit = {
  waiting: 4,
  passed: 4,
  completed: 3,
  cancelled: 2,
} as const;

function group(status: string): number {
  if (active.has(status)) return 0;
  if (status === "COMPLETED") return 1;
  if (closed.has(status)) return 2;
  return 3;
}

export type VisitGroups<T extends { status: string }> = {
  waiting: T[];
  passed: T[];
  completed: T[];
  cancelled: T[];
};

/** Future active visits stay upcoming. Started ones are listed apart. Completed, then cancelled. */
export function groupVisits<T extends { status: string; startsAt: string }>(
  visits: T[],
  now = Date.now(),
): VisitGroups<T> {
  const sorted = [...visits].sort(compareVisitsByPriority);
  const waiting: T[] = [];
  const passed: T[] = [];
  const completed: T[] = [];
  const cancelled: T[] = [];
  for (const visit of sorted) {
    if (visit.status === "COMPLETED") completed.push(visit);
    else if (closed.has(visit.status)) cancelled.push(visit);
    else if (Date.parse(visit.startsAt) <= now) passed.push(visit);
    else waiting.push(visit);
  }
  passed.sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt));
  return { waiting, passed, completed, cancelled };
}

/** Active visits first, soonest at the top. Completed, then cancelled, newest first. */
export function compareVisitsByPriority(
  left: { status: string; startsAt: string },
  right: { status: string; startsAt: string },
): number {
  const byGroup = group(left.status) - group(right.status);
  if (byGroup !== 0) return byGroup;
  const byTime = Date.parse(left.startsAt) - Date.parse(right.startsAt);
  if (active.has(left.status)) {
    if (byTime !== 0) return byTime;
    if (left.status === right.status) return 0;
    return left.status === "CONFIRMED" ? -1 : 1;
  }
  return -byTime;
}
