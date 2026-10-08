"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { armeniaPhone, PhoneField } from "@/features/auth/phone-field";

export type ClinicProfile = {
  name: string;
  description: string;
  address: string;
  phone: string;
  district: string;
};

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function ClinicProfileForm({ clinicId, clinic }: { clinicId: string; clinic: ClinicProfile }) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const phone = armeniaPhone(String(form.get("phoneLocal") ?? ""));
    if (!phone) {
      setFailed(true);
      setMessage(t("saveFailed"));
      return;
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics/${clinicId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        address: String(form.get("address") ?? ""),
        district: String(form.get("district") ?? ""),
        description: String(form.get("description") ?? ""),
        phone,
      }),
    });
    setFailed(!response.ok);
    setMessage(response.ok ? t("saved") : t("saveFailed"));
  }

  return (
    <form className="grid max-w-xl gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" onSubmit={(event) => void onSubmit(event)}>
      <label className={fieldClass}>{platform("clinicName")}<input name="name" required defaultValue={clinic.name} className={controlClass} /></label>
      <label className={fieldClass}>{platform("address")}<input name="address" required defaultValue={clinic.address} className={controlClass} /></label>
      <label className={fieldClass}>{platform("district")}<input name="district" defaultValue={clinic.district} className={controlClass} /></label>
      <PhoneField label={platform("phone")} phone={clinic.phone} />
      <label className={fieldClass}>{platform("description")}<textarea name="description" rows={4} defaultValue={clinic.description} className={controlClass} /></label>
      <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("save")}</button>
      {message ? <p className={failed ? "m-0 text-danger" : "m-0 text-muted"}>{message}</p> : null}
    </form>
  );
}
