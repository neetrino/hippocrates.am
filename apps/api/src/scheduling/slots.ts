export type MinuteWindow = {
  weekday: number;
  startMinute: number;
  endMinute: number;
};

export type TimeRange = {
  start: Date;
  end: Date;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export function timeZoneOffsetMinutes(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(instant);
  const pick = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    return Number(value);
  };
  const asUtc = Date.UTC(pick("year"), pick("month") - 1, pick("day"), pick("hour"), pick("minute"));
  return Math.round((asUtc - instant.getTime()) / 60_000);
}

export function localToUtc(isoDate: string, minuteOfDay: number, timeZone: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number) as [number, number, number];
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const offset = timeZoneOffsetMinutes(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offset * 60_000);
}

export function zonedWeekday(instant: Date, timeZone: string): number {
  const name = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(instant);
  const index = WEEKDAYS.indexOf(name as (typeof WEEKDAYS)[number]);
  return index < 0 ? 0 : index;
}

function overlaps(start: Date, end: Date, ranges: TimeRange[]): boolean {
  return ranges.some((range) => start < range.end && end > range.start);
}

export function bookableStarts(input: {
  isoDate: string;
  timeZone: string;
  windows: MinuteWindow[];
  durationMinutes: number;
  busy: TimeRange[];
  blocked: TimeRange[];
}): Date[] {
  const noon = localToUtc(input.isoDate, 12 * 60, input.timeZone);
  const weekday = zonedWeekday(noon, input.timeZone);
  const starts: Date[] = [];
  const occupied = [...input.busy, ...input.blocked];
  for (const window of input.windows) {
    if (window.weekday !== weekday) continue;
    for (
      let minute = window.startMinute;
      minute + input.durationMinutes <= window.endMinute;
      minute += input.durationMinutes
    ) {
      const start = localToUtc(input.isoDate, minute, input.timeZone);
      const end = new Date(start.getTime() + input.durationMinutes * 60_000);
      if (!overlaps(start, end, occupied)) starts.push(start);
    }
  }
  return starts;
}
