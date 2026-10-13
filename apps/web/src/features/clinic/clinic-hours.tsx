"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export type HourWindow = { weekday: number; startMinute: number; endMinute: number };

const HOUR_STEP_MINUTES = 30;
const FIRST_SLOT_MINUTE = 6 * 60;
const LAST_SLOT_MINUTE = 22 * 60;
const TIME_SELECT_CLASS = "field-control w-[8.75rem] shrink-0 cursor-pointer py-2 text-left";

const WEEKDAYS = [
  { day: 1, key: "weekMon" },
  { day: 2, key: "weekTue" },
  { day: 3, key: "weekWed" },
  { day: 4, key: "weekThu" },
  { day: 5, key: "weekFri" },
  { day: 6, key: "weekSat" },
  { day: 0, key: "weekSun" },
] as const;

export function ClinicHours({ clinicId, clinicWindows }: { clinicId: string; clinicWindows: HourWindow[] }) {
  const t = useTranslations("desk");
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="m-0">{t("hours")}</h2>
        <p className="m-0 text-muted">{t("hoursHint")}</p>
      </div>
      <div className="rounded-card border border-line bg-white p-5 shadow-soft">
        <HoursEditor title={t("clinicHours")} windows={clinicWindows} savePath={`/clinics/${clinicId}/windows`} />
      </div>
    </section>
  );
}

export function HoursEditor({ title, windows, savePath }: { title: string; windows: HourWindow[]; savePath: string }) {
  const t = useTranslations("desk");
  const [days, setDays] = useState(() => dayFields(windows));
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  async function save(): Promise<void> {
    setPending(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${savePath}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ windows: windowsFrom(days) }),
    });
    setPending(false);
    setFailed(!response.ok);
    setMessage(response.ok ? t("hoursSaved") : t("hoursFailed"));
  }

  return (
    <form
      className="grid gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <h3 className="m-0">{title}</h3>
      <div className="grid gap-2">
        {WEEKDAYS.map((weekday) => (
          <DayRow
            key={weekday.day}
            label={t(weekday.key)}
            start={days[weekday.day]?.start ?? ""}
            end={days[weekday.day]?.end ?? ""}
            onStart={(start) => setDays((current) => ({ ...current, [weekday.day]: { start, end: current[weekday.day]?.end ?? "" } }))}
            onEnd={(end) => setDays((current) => ({ ...current, [weekday.day]: { start: current[weekday.day]?.start ?? "", end } }))}
          />
        ))}
      </div>
      <button className="btn btn-primary mt-1 w-fit" type="submit" disabled={pending}>
        {t("saveHours")}
      </button>
      {message ? <p className={`m-0 text-sm ${failed ? "text-danger" : "text-accent"}`}>{message}</p> : null}
    </form>
  );
}

function DayRow({
  label,
  start,
  end,
  onStart,
  onEnd,
}: {
  label: string;
  start: string;
  end: string;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
}) {
  const t = useTranslations("desk");
  const open = Boolean(start && end);
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-[0.875rem] border px-4 py-3 ${
        open ? "border-line bg-accent-soft" : "border-dashed border-line bg-sand"
      }`}
    >
      <span className="min-w-[7.5rem] font-semibold">{label}</span>
      <span className="flex shrink-0 items-center gap-2">
        <TimeSelect value={start} closedLabel={t("hoursClosed")} name={`${label} ${t("hoursStart")}`} onChange={onStart} />
        <span className="text-muted" aria-hidden="true">
          –
        </span>
        <TimeSelect value={end} closedLabel={t("hoursClosed")} name={`${label} ${t("hoursEnd")}`} onChange={onEnd} />
      </span>
    </div>
  );
}

function TimeSelect({
  value,
  closedLabel,
  name,
  onChange,
}: {
  value: string;
  closedLabel: string;
  name: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function close(event: MouseEvent): void {
      if (root.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="relative" ref={root}>
      <button type="button" className={TIME_SELECT_CLASS} aria-expanded={open} aria-label={name} onClick={() => setOpen((current) => !current)}>
        {value || closedLabel}
      </button>
      {open ? <TimeMenu value={value} closedLabel={closedLabel} onPick={(time) => { onChange(time); setOpen(false); }} /> : null}
    </div>
  );
}

function TimeMenu({ value, closedLabel, onPick }: { value: string; closedLabel: string; onPick: (time: string) => void }) {
  return (
    <ul className="absolute top-full z-20 mt-1 max-h-36 w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-soft">
      <li>
        <TimeOption active={!value} label={closedLabel} onPick={() => onPick("")} />
      </li>
      {timesFor(value).map((time) => (
        <li key={time}>
          <TimeOption active={value === time} label={time} onPick={() => onPick(time)} />
        </li>
      ))}
    </ul>
  );
}

function TimeOption({ active, label, onPick }: { active: boolean; label: string; onPick: () => void }) {
  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer rounded-lg px-2 py-1 text-left text-sm ${active ? "bg-accent-soft font-semibold" : "hover:bg-sand"}`}
      onClick={onPick}
    >
      {label}
    </button>
  );
}

function timesFor(current: string): string[] {
  if (!current || HOUR_CHOICES.includes(current)) return HOUR_CHOICES;
  return [...HOUR_CHOICES, current].sort();
}

type DayFields = Record<number, { start: string; end: string }>;

function dayFields(windows: HourWindow[]): DayFields {
  const fields: DayFields = {};
  for (const weekday of WEEKDAYS) fields[weekday.day] = { start: "", end: "" };
  for (const window of windows) {
    fields[window.weekday] = { start: minutesToTime(window.startMinute), end: minutesToTime(window.endMinute) };
  }
  return fields;
}

function windowsFrom(days: DayFields): HourWindow[] {
  return WEEKDAYS.flatMap((weekday) => {
    const start = timeToMinutes(days[weekday.day]?.start ?? "");
    const end = timeToMinutes(days[weekday.day]?.end ?? "");
    if (start === null || end === null || end <= start) return [];
    return [{ weekday: weekday.day, startMinute: start, endMinute: end }];
  });
}

function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

const HOUR_CHOICES: string[] = [];
for (let minute = FIRST_SLOT_MINUTE; minute <= LAST_SLOT_MINUTE; minute += HOUR_STEP_MINUTES) {
  HOUR_CHOICES.push(minutesToTime(minute));
}
