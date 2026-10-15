"use client";

import { useTranslations } from "next-intl";
import type { HourWindow } from "@/features/clinic/clinic-hours";

const WEEKDAYS = [
  { day: 1, key: "weekMon", short: "weekMonShort" },
  { day: 2, key: "weekTue", short: "weekTueShort" },
  { day: 3, key: "weekWed", short: "weekWedShort" },
  { day: 4, key: "weekThu", short: "weekThuShort" },
  { day: 5, key: "weekFri", short: "weekFriShort" },
  { day: 6, key: "weekSat", short: "weekSatShort" },
  { day: 0, key: "weekSun", short: "weekSunShort" },
] as const;

type WeekSpan = { from: number; to: number; startMinute: number; endMinute: number };

export function ClinicWeekRead({ windows }: { windows: HourWindow[] }) {
  const t = useTranslations("desk");
  const portal = useTranslations("portal");
  const byDay = new Map(windows.map((window) => [window.weekday, window]));
  const spans = clinicWeekSpans(windows);
  return (
    <section className="grid gap-3 rounded-card border border-line bg-white p-5 shadow-soft">
      <div className="grid gap-1">
        <h2 className="m-0 text-base">{t("clinicHours")}</h2>
        {windows.length === 0 ? <p className="m-0 text-sm text-muted">{portal("emptySection")}</p> : null}
        {spans.map((span) => (
          <p key={`${span.from}-${span.to}`} className="m-0 text-sm font-semibold text-accent">
            {spanLabel(span, t)}
          </p>
        ))}
      </div>
      <div className="grid gap-2">
        {WEEKDAYS.map((weekday) => {
          const window = byDay.get(weekday.day);
          return <DayRead key={weekday.day} label={t(weekday.key)} window={window} closedLabel={t("hoursClosed")} />;
        })}
      </div>
    </section>
  );
}

function DayRead({
  label,
  window,
  closedLabel,
}: {
  label: string;
  window: HourWindow | undefined;
  closedLabel: string;
}) {
  const open = Boolean(window);
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-[0.875rem] border px-4 py-3 ${
        open ? "border-line bg-accent-soft" : "border-dashed border-line bg-sand"
      }`}
    >
      <span className="min-w-[7.5rem] font-semibold">{label}</span>
      <span className={`text-sm ${open ? "font-semibold text-ink" : "text-muted"}`}>
        {window ? `${clock(window.startMinute)} – ${clock(window.endMinute)}` : closedLabel}
      </span>
    </div>
  );
}

function clinicWeekSpans(windows: HourWindow[]): WeekSpan[] {
  const byDay = new Map(windows.map((window) => [window.weekday, window]));
  const spans: WeekSpan[] = [];
  for (const [index, weekday] of WEEKDAYS.entries()) {
    const window = byDay.get(weekday.day);
    if (!window) continue;
    const previous = WEEKDAYS[index - 1];
    const last = spans[spans.length - 1];
    if (last && previous && last.to === previous.day && last.startMinute === window.startMinute && last.endMinute === window.endMinute) {
      last.to = weekday.day;
      continue;
    }
    spans.push({ from: weekday.day, to: weekday.day, startMinute: window.startMinute, endMinute: window.endMinute });
  }
  return spans;
}

function spanLabel(span: WeekSpan, t: (key: (typeof WEEKDAYS)[number]["short"]) => string): string {
  const hours = `${clock(span.startMinute)} – ${clock(span.endMinute)}`;
  const from = t(shortKey(span.from));
  if (span.from === span.to) return `${from} · ${hours}`;
  return `${from}–${t(shortKey(span.to))} · ${hours}`;
}

function shortKey(day: number): (typeof WEEKDAYS)[number]["short"] {
  return WEEKDAYS.find((weekday) => weekday.day === day)?.short ?? "weekMonShort";
}

function clock(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
