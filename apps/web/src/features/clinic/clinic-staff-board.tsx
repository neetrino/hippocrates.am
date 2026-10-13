"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ClinicDayOff } from "@/features/clinic/clinic-day-off";
import { DoctorCard, toDoctorDraft, type DoctorRow } from "@/features/clinic/clinic-doctor-editor";
import { ClinicDoctorForm } from "@/features/clinic/clinic-forms";
import { ClinicHours, HoursEditor, type HourWindow } from "@/features/clinic/clinic-hours";
import { EmptyState } from "@/shared/ui/empty-state";

type DayOff = { id: string; doctorId: string; label: string };

export function ClinicStaffBoard({
  clinicId,
  doctors,
  clinicWindows,
  doctorWindows,
  days,
}: {
  clinicId: string;
  doctors: DoctorRow[];
  clinicWindows: HourWindow[];
  doctorWindows: { id: string; windows: HourWindow[] }[];
  days: DayOff[];
}) {
  const t = useTranslations("desk");
  const [open, setOpen] = useState(false);

  return (
    <div className="grid gap-6">
      <button className="btn btn-primary min-h-10 w-fit px-4" type="button" onClick={() => setOpen((value) => !value)}>
        {t("add")}
      </button>
      {open ? <ClinicDoctorForm clinicId={clinicId} onClose={() => setOpen(false)} /> : null}
      <ClinicHours clinicId={clinicId} clinicWindows={clinicWindows} />
      {doctors.length === 0 ? <EmptyState>{t("emptyStaff")}</EmptyState> : null}
      {doctors.map((doctor) => (
        <DoctorCard
          key={doctor.id}
          clinicId={clinicId}
          doctor={toDoctorDraft(doctor)}
          extra={
            <DoctorSchedule
              clinicId={clinicId}
              doctorId={doctor.id}
              windows={doctorWindows.find((item) => item.id === doctor.id)?.windows ?? []}
              days={days.filter((day) => day.doctorId === doctor.id)}
            />
          }
        />
      ))}
    </div>
  );
}

function DoctorSchedule({
  clinicId,
  doctorId,
  windows,
  days,
}: {
  clinicId: string;
  doctorId: string;
  windows: HourWindow[];
  days: { id: string; label: string }[];
}) {
  const t = useTranslations("desk");
  return (
    <div className="grid gap-5">
      <HoursEditor
        title={t("doctorHours")}
        windows={windows}
        savePath={`/clinics/${clinicId}/doctors/${doctorId}/windows`}
      />
      <ClinicDayOff clinicId={clinicId} doctorId={doctorId} days={days} />
    </div>
  );
}
