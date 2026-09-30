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

  return (
    <div className="split">
      <form className="panel stack" onSubmit={(event) => void onDoctor(event)}>
        <h2>{t("newDoctor")}</h2>
        <label className="field">{common("name")}<input name="displayName" required /></label>
        <label className="field">{auth("email")}<input name="email" type="email" required /></label>
        <label className="field">{auth("password")}<input name="password" type="password" required /></label>
        <label className="field">{catalog("specialty")}<input name="specialty" required /></label>
        <button className="btn" type="submit">{t("saveDoctor")}</button>
      </form>
      <form className="panel stack" onSubmit={(event) => void onOffering(event)}>
        <h2>{t("newService")}</h2>
        <label className="field">
          {t("doctor")}
          <select name="doctorId" required defaultValue={doctors[0]?.id ?? ""}>
            {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
          </select>
        </label>
        <label className="field">{common("name")}<input name="name" required /></label>
        <label className="field">{t("amd")}<input name="priceAmd" type="number" required /></label>
        <label className="field">{t("duration")}<input name="durationMinutes" type="number" required /></label>
        <button className="btn" type="submit">{t("add")}</button>
      </form>
      {message ? <p className="error">{message}</p> : null}
    </div>
  );
}
