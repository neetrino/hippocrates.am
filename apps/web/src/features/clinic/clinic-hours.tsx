"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export type HourWindow = { weekday: number; startMinute: number; endMinute: number };

type DoctorHours = { id: string; name: string; windows: HourWindow[] };

const WEEKDAYS = [
  { day: 1, key: "weekMon" },
  { day: 2, key: "weekTue" },
  { day: 3, key: "weekWed" },
  { day: 4, key: "weekThu" },
  { day: 5, key: "weekFri" },
  { day: 6, key: "weekSat" },
  { day: 0, key: "weekSun" },
] as const;

export function ClinicHours({
  clinicId,
  clinicWindows,
  doctors,
}: {
  clinicId: string;
  clinicWindows: HourWindow[];
  doctors: DoctorHours[];
}) {
  const t = useTranslations("desk");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const doctor = doctors.find((item) => item.id === doctorId);
  return (
    <section className="grid gap-5 pt-7">
      <div>
        <h2>{t("hours")}</h2>
        <p className="m-0 text-muted">{t("hoursHint")}</p>
      </div>
      <HoursEditor title={t("clinicHours")} windows={clinicWindows} savePath={`/clinics/${clinicId}/windows`} />
      {doctor ? (
        <div className="grid gap-3">
          <label className="grid max-w-sm gap-1.5 text-[0.92rem] font-semibold">
            {t("doctor")}
            <select
              className="rounded-xl border border-line bg-white px-3.5 py-3 font-normal"
              value={doctorId}
              onChange={(event) => setDoctorId(event.target.value)}
            >
              {doctors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <HoursEditor
            key={doctor.id}
            title={t("doctorHours")}
            windows={doctor.windows}
            savePath={`/clinics/${clinicId}/doctors/${doctor.id}/windows`}
          />
        </div>
      ) : null}
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
      className="grid gap-3 rounded-card border border-line bg-white p-5 shadow-soft"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <h3 className="m-0">{title}</h3>
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
      <button
        className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white disabled:opacity-55"
        type="submit"
        disabled={pending}
      >
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
  const field = "rounded-xl border border-line bg-white px-3 py-2 font-normal";
  return (
    <div className="grid items-center gap-2 sm:grid-cols-[9rem_1fr_1fr]">
      <span className="font-semibold">{label}</span>
      <input className={field} type="time" value={start} onChange={(event) => onStart(event.target.value)} />
      <input className={field} type="time" value={end} onChange={(event) => onEnd(event.target.value)} />
    </div>
  );
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
