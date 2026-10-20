const ZONE = "Asia/Yerevan";

/** Later weekdays in Yerevan. Offset 1 skips today. Offset 2 also skips tomorrow. */
export function upcomingWeekdays(count: number, now = new Date(), firstOffset = 1): string[] {
  const days: string[] = [];
  for (let offset = firstOffset; days.length < count && offset < 21; offset += 1) {
    const instant = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const weekday = new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "short" }).format(instant);
    if (weekday === "Sat" || weekday === "Sun") continue;
    const iso = new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(instant);
    if (!days.includes(iso)) days.push(iso);
  }
  if (days.length < count) throw new Error("E2E refused: no open weekday.");
  return days;
}
