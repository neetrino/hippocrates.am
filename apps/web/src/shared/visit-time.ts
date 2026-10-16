const YEREVAN_TIME_ZONE = "Asia/Yerevan";

export function visitStarted(startsAt: string, now = Date.now()): boolean {
  return Date.parse(startsAt) <= now;
}

export function todayYerevan(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: YEREVAN_TIME_ZONE }).format(now);
}
