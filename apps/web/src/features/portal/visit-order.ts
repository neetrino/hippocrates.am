const active = new Set(["CONFIRMED", "REQUESTED"]);

/** How many visits stay visible before "More" in each section. */
export const visitPreviewLimit = {
  waiting: 4,
  completed: 3,
  cancelled: 2,
} as const;

function group(status: string): number {
  if (active.has(status)) return 0;
  if (status === "COMPLETED") return 1;
  if (status === "CANCELLED") return 2;
  return 3;
}

export type VisitGroups<T extends { status: string }> = {
  waiting: T[];
  completed: T[];
  cancelled: T[];
};

/** Waiting and confirmed stay together. Completed, then cancelled. */
export function groupVisits<T extends { status: string; startsAt: string }>(visits: T[]): VisitGroups<T> {
  const sorted = [...visits].sort(compareVisitsByPriority);
  const waiting: T[] = [];
  const completed: T[] = [];
  const cancelled: T[] = [];
  for (const visit of sorted) {
    if (visit.status === "COMPLETED") completed.push(visit);
    else if (visit.status === "CANCELLED") cancelled.push(visit);
    else waiting.push(visit);
  }
  return { waiting, completed, cancelled };
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
