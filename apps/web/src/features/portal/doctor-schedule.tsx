"use client";

import { useTranslations } from "next-intl";
import { HoursEditor, type HourWindow } from "@/features/clinic/clinic-hours";

const weekdayKey = {
  1: "weekMon",
  2: "weekTue",
  3: "weekWed",
  4: "weekThu",
  5: "weekFri",
  6: "weekSat",
  0: "weekSun",
} as const;

type WeekKey = (typeof weekdayKey)[keyof typeof weekdayKey];

export function DoctorSchedule({ clinic, doctor }: { clinic: HourWindow[]; doctor: HourWindow[] }) {
  const t = useTranslations("desk");
  return (
    <div className="grid gap-5">
      <p className="m-0 text-muted">{t("hoursHint")}</p>
      <ClinicHours windows={clinic} />
      <HoursEditor title={t("doctorHours")} windows={doctor} savePath="/doctors/me/windows" />
    </div>
  );
}

function ClinicHours({ windows }: { windows: HourWindow[] }) {
  const t = useTranslations("desk");
  const portal = useTranslations("portal");
  return (
    <section className="grid gap-2 rounded-[1.6rem] bg-white p-5 shadow-soft">
      <h2 className="m-0 text-base">{t("clinicHours")}</h2>
      {windows.length === 0 ? <p className="m-0 text-sm text-muted">{portal("emptySection")}</p> : null}
      {windows.map((window) => (
        <p key={window.weekday} className="m-0 text-sm">
          <span className="font-semibold">{t(labelFor(window.weekday))}</span> {clock(window.startMinute)}–{clock(window.endMinute)}
        </p>
      ))}
    </section>
  );
}

function labelFor(weekday: number): WeekKey {
  if (weekday in weekdayKey) return weekdayKey[weekday as keyof typeof weekdayKey];
  return "weekMon";
}

function clock(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}
