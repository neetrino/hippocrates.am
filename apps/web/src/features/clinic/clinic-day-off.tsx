"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

type DoctorOption = { id: string; name: string };
type DayOff = { id: string; doctorId: string; label: string };

export function ClinicDayOff({
  clinicId,
  doctors,
  days,
}: {
  clinicId: string;
  doctors: DoctorOption[];
  days: DayOff[];
}) {
  const t = useTranslations("desk");
  const [doctorId, setDoctorId] = useState(doctors[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const visible = days.filter((day) => day.doctorId === doctorId);
  const doctorName = new Map(doctors.map((doctor) => [doctor.id, doctor.name]));

  async function closeDay(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics/${clinicId}/doctors/${doctorId}/exceptions`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ date: String(form.get("date") ?? "") }),
    });
    if (response.ok) window.location.reload();
    else setMessage(t("dayOffFailed"));
  }

  async function openDay(id: string): Promise<void> {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics/${clinicId}/doctors/${doctorId}/exceptions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) window.location.reload();
    else setMessage(t("dayOffFailed"));
  }

  if (!doctorId) return null;

  return (
    <section className="grid gap-3">
      <div>
        <h2>{t("dayOff")}</h2>
        <p className="m-0 text-muted">{t("dayOffHint")}</p>
      </div>
      <label className="grid max-w-sm gap-1.5 text-[0.92rem] font-semibold">
        {t("doctor")}
        <select className="rounded-xl border border-line bg-white px-3.5 py-3 font-normal" value={doctorId} onChange={(event) => setDoctorId(event.target.value)}>
          {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
        </select>
      </label>
      {visible.map((day) => (
        <p className="m-0 flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5" key={day.id}>
          <span>{doctorName.get(day.doctorId)} · {day.label}</span>
          <button className="cursor-pointer rounded-full border-0 bg-white px-3 py-2 text-sm font-semibold text-accent" type="button" onClick={() => void openDay(day.id)}>{t("openDay")}</button>
        </p>
      ))}
      <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => void closeDay(event)}>
        <label className="grid gap-1.5 text-[0.92rem] font-semibold">
          {t("pickDate")}
          <input name="date" type="date" required className="rounded-xl border border-line bg-white px-3.5 py-3 font-normal" />
        </label>
        <button className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("closeDay")}</button>
      </form>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </section>
  );
}
