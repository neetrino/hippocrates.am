"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TimeSelect } from "@/features/clinic/clinic-hour-field";

export type HourWindow = { weekday: number; startMinute: number; endMinute: number };

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

export function HoursEditor({
  title,
  windows,
  savePath,
  bounds,
  hint,
}: {
  title: string;
  windows: HourWindow[];
  savePath: string;
  bounds?: HourWindow[];
  hint?: string;
}) {
  const t = useTranslations("desk");
  const [days, setDays] = useState(() => dayFields(clipWindows(windows, bounds)));
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
      {hint ? <p className="m-0 text-sm text-muted">{hint}</p> : null}
      <HoursWeek days={days} bounds={bounds} onDays={setDays} />
      <button className="btn btn-primary mt-1 w-fit" type="submit" disabled={pending}>
        {t("saveHours")}
      </button>
      {message ? <p className={`m-0 text-sm ${failed ? "text-danger" : "text-accent"}`}>{message}</p> : null}
    </form>
  );
}

function HoursWeek({
  days,
  bounds,
  onDays,
}: {
  days: DayFields;
  bounds?: HourWindow[];
  onDays: (next: DayFields | ((current: DayFields) => DayFields)) => void;
}) {
  const t = useTranslations("desk");
  return (
    <div className="grid gap-2">
      {WEEKDAYS.map((weekday) => {
        const bound = dayBound(weekday.day, bounds);
        return (
          <DayRow
            key={weekday.day}
            label={t(weekday.key)}
            start={days[weekday.day]?.start ?? ""}
            end={days[weekday.day]?.end ?? ""}
            locked={bound === null}
            minMinute={bound?.startMinute}
            maxMinute={bound?.endMinute}
            onStart={(start) => onDays((current) => ({ ...current, [weekday.day]: { start, end: current[weekday.day]?.end ?? "" } }))}
            onEnd={(end) => onDays((current) => ({ ...current, [weekday.day]: { start: current[weekday.day]?.start ?? "", end } }))}
          />
        );
      })}
    </div>
  );
}

function DayRow({
  label,
  start,
  end,
  locked,
  minMinute,
  maxMinute,
  onStart,
  onEnd,
}: {
  label: string;
  start: string;
  end: string;
  locked?: boolean;
  minMinute?: number;
  maxMinute?: number;
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
      {locked ? (
        <span className="text-sm text-muted">{t("hoursClinicClosed")}</span>
      ) : (
        <span className="flex shrink-0 items-center gap-2">
          <HourField label={label} value={start} minMinute={minMinute} maxMinute={maxMinute} onChange={onStart} />
          <span className="text-muted" aria-hidden="true">
            –
          </span>
          <HourField label={label} value={end} end minMinute={minMinute} maxMinute={maxMinute} onChange={onEnd} />
        </span>
      )}
    </div>
  );
}

function HourField({
  label,
  value,
  end,
  minMinute,
  maxMinute,
  onChange,
}: {
  label: string;
  value: string;
  end?: boolean;
  minMinute?: number;
  maxMinute?: number;
  onChange: (value: string) => void;
}) {
  const t = useTranslations("desk");
  return (
    <TimeSelect
      value={value}
      closedLabel={t("hoursClosed")}
      name={`${label} ${end ? t("hoursEnd") : t("hoursStart")}`}
      listLabel={t("hoursList")}
      placeholder={t("hoursTimePlaceholder")}
      minMinute={minMinute}
      maxMinute={maxMinute}
      onChange={onChange}
    />
  );
}

type DayFields = Record<number, { start: string; end: string }>;

function dayBound(weekday: number, bounds?: HourWindow[]): HourWindow | null | undefined {
  if (!bounds || bounds.length === 0) return undefined;
  return bounds.find((window) => window.weekday === weekday) ?? null;
}

function clipWindows(windows: HourWindow[], bounds?: HourWindow[]): HourWindow[] {
  if (!bounds || bounds.length === 0) return windows;
  return windows.flatMap((window) => {
    const bound = bounds.find((item) => item.weekday === window.weekday);
    if (!bound) return [];
    const startMinute = Math.max(window.startMinute, bound.startMinute);
    const endMinute = Math.min(window.endMinute, bound.endMinute);
    return startMinute < endMinute ? [{ weekday: window.weekday, startMinute, endMinute }] : [];
  });
}

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
