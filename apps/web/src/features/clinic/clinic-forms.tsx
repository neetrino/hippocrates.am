"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

type DoctorOption = { id: string; name: string };

async function post(path: string, payload: Record<string, string | number>): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

export function ClinicForms({ clinicId, doctors }: { clinicId: string; doctors: DoctorOption[] }) {
  const [message, setMessage] = useState("");
  const t = useTranslations("desk");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const catalog = useTranslations("catalog");

  async function onDoctor(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await post(`/clinics/${clinicId}/doctors`, {
      displayName: String(form.get("displayName") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      specialty: String(form.get("specialty") ?? ""),
    });
    if (ok) window.location.reload();
    else setMessage(t("doctorFailed"));
  }

  async function onOffering(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await post(`/clinics/${clinicId}/offerings`, {
      doctorId: String(form.get("doctorId") ?? ""),
      name: String(form.get("name") ?? ""),
      priceAmd: Number(form.get("priceAmd")),
      durationMinutes: Number(form.get("durationMinutes")),
    });
    if (ok) window.location.reload();
    else setMessage(t("serviceFailed"));
  }

  const fieldClass = "field-label";
  const controlClass = "field-control";
  const panelClass = "grid gap-3.5 rounded-card bg-surface p-5 shadow-soft";
  const btnClass = "btn btn-primary";

  return (
    <div className="grid gap-5 md:grid-cols-[1.3fr_0.7fr] md:items-start">
      <form className={panelClass} onSubmit={(event) => void onDoctor(event)}>
        <h2>{t("newDoctor")}</h2>
        <label className={fieldClass}>{common("name")}<input name="displayName" required className={controlClass} /></label>
        <label className={fieldClass}>{auth("email")}<input name="email" type="email" required className={controlClass} /></label>
        <label className={fieldClass}>{auth("password")}<input name="password" type="password" required className={controlClass} /></label>
        <label className={fieldClass}>{catalog("specialty")}<input name="specialty" required className={controlClass} /></label>
        <button className={btnClass} type="submit">{t("saveDoctor")}</button>
      </form>
      <form className={panelClass} onSubmit={(event) => void onOffering(event)}>
        <h2>{t("newService")}</h2>
        <label className={fieldClass}>
          {t("doctor")}
          <select name="doctorId" required defaultValue={doctors[0]?.id ?? ""} className={controlClass}>
            {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
          </select>
        </label>
        <label className={fieldClass}>{common("name")}<input name="name" required className={controlClass} /></label>
        <label className={fieldClass}>{t("amd")}<input name="priceAmd" type="number" required className={controlClass} /></label>
        <label className={fieldClass}>{t("duration")}<input name="durationMinutes" type="number" required className={controlClass} /></label>
        <button className={btnClass} type="submit">{t("add")}</button>
      </form>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </div>
  );
}
