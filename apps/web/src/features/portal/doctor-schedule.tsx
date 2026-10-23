"use client";

import { useTranslations } from "next-intl";
import { HoursEditor, type HourWindow } from "@/features/clinic/clinic-hours";
import { ClinicWeekRead } from "@/features/clinic/clinic-week-read";

export function DoctorSchedule({ clinic, doctor }: { clinic: HourWindow[]; doctor: HourWindow[] }) {
  const t = useTranslations("desk");
  return (
    <div className="grid gap-5">
      <p className="m-0 text-muted">{t("doctorScheduleHint")}</p>
      <ClinicWeekRead windows={clinic} />
      <HoursEditor
        title={t("doctorHours")}
        windows={doctor}
        bounds={clinic}
        hint={t("doctorHoursHint")}
        savePath="/doctors/me/windows"
      />
    </div>
  );
}
