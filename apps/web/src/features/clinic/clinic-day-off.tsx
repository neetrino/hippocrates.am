"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

type DayOff = { id: string; label: string };

export function ClinicDayOff({
  clinicId,
  doctorId,
  days,
}: {
  clinicId: string;
  doctorId: string;
  days: DayOff[];
}) {
  const t = useTranslations("desk");
  const [message, setMessage] = useState("");

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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics/${clinicId}/doctors/${doctorId}/exceptions/${id}`,
      { method: "DELETE", credentials: "include" },
    );
    if (response.ok) window.location.reload();
    else setMessage(t("dayOffFailed"));
  }

  return (
    <section className="grid gap-3">
      <div>
        <h3 className="m-0">{t("dayOff")}</h3>
        <p className="m-0 text-sm text-muted">{t("dayOffHint")}</p>
      </div>
      {days.map((day) => (
        <p className="m-0 flex items-center justify-between gap-3 rounded-card border border-line bg-white px-4 py-3" key={day.id}>
          <span>{day.label}</span>
          <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => void openDay(day.id)}>
            {t("openDay")}
          </button>
        </p>
      ))}
      <form className="flex flex-wrap items-end gap-3" onSubmit={(event) => void closeDay(event)}>
        <label className="grid gap-1.5 text-[0.92rem] font-semibold">
          {t("pickDate")}
          <input name="date" type="date" required className="rounded-xl border border-line bg-white px-3.5 py-3 font-normal" />
        </label>
        <button className="btn btn-primary w-fit" type="submit">{t("closeDay")}</button>
      </form>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </section>
  );
}
