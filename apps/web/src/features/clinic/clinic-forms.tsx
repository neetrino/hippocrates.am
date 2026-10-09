"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";

type DoctorOption = { id: string; name: string };

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";
const panelClass = "grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft";
const btnClass =
  "inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent";

async function postJson(path: string, payload: Record<string, string | number | boolean>): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

export function ClinicDoctorForm({ clinicId }: { clinicId: string }) {
  const [message, setMessage] = useState("");
  const t = useTranslations("desk");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const catalog = useTranslations("catalog");

  async function onDoctor(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await postJson(`/clinics/${clinicId}/doctors`, {
      displayName: String(form.get("displayName") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      specialty: String(form.get("specialty") ?? ""),
    });
    if (ok) window.location.reload();
    else setMessage(t("doctorFailed"));
  }

  return (
    <form className={panelClass} onSubmit={(event) => void onDoctor(event)}>
      <h2>{t("newDoctor")}</h2>
      <label className={fieldClass}>{common("name")}<input name="displayName" required className={controlClass} /></label>
      <label className={fieldClass}>{auth("email")}<input name="email" type="email" required className={controlClass} /></label>
      <label className={fieldClass}>{auth("password")}<input name="password" type="password" required minLength={8} className={controlClass} /></label>
      <label className={fieldClass}>{catalog("specialty")}<input name="specialty" required className={controlClass} /></label>
      <button className={btnClass} type="submit">{t("saveDoctor")}</button>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </form>
  );
}

export function ClinicServiceForm({ clinicId, doctors }: { clinicId: string; doctors: DoctorOption[] }) {
  const [message, setMessage] = useState("");
  const t = useTranslations("desk");
  const common = useTranslations("common");

  async function onOffering(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await postJson(`/clinics/${clinicId}/offerings`, {
      doctorId: String(form.get("doctorId") ?? ""),
      name: String(form.get("name") ?? ""),
      priceAmd: Number(form.get("priceAmd")),
      durationMinutes: Number(form.get("durationMinutes")),
      isEstimate: form.get("isEstimate") === "on",
    });
    if (ok) window.location.reload();
    else setMessage(t("serviceFailed"));
  }

  return (
    <form className={panelClass} onSubmit={(event) => void onOffering(event)}>
      <h2>{t("newService")}</h2>
      <label className={fieldClass}>
        {t("doctor")}
        <select name="doctorId" required defaultValue={doctors[0]?.id ?? ""} className={controlClass}>
          {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
        </select>
      </label>
      <label className={fieldClass}>{common("name")}<input name="name" required className={controlClass} /></label>
      <label className={fieldClass}>{t("amd")}<input name="priceAmd" type="number" min={0} required className={controlClass} /></label>
      <label className={fieldClass}>{t("duration")}<input name="durationMinutes" type="number" min={5} required className={controlClass} /></label>
      <label className="flex items-center gap-2 text-[0.92rem] font-semibold">
        <input name="isEstimate" type="checkbox" />
        {common("estimate")}
      </label>
      <button className={btnClass} type="submit">{t("add")}</button>
      {message ? <p className="m-0 text-danger">{message}</p> : null}
    </form>
  );
}
