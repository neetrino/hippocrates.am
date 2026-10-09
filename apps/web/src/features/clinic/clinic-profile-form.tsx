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
  coverUrl: string | null;
};

export type ClinicCopy = {
  name: string;
  district: string;
  address: string;
  description: string;
};

type LocaleDoctor = { id: string; displayName: string; specialty: string; bio: string };
export type ClinicLocaleDraft = ClinicCopy & { doctors: LocaleDoctor[] };
type ContentLocale = "hy" | "en" | "ru";
type ForeignLocale = "en" | "ru";

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function ClinicProfileForm({
  clinicId,
  clinic,
  locales,
}: {
  clinicId: string;
  clinic: ClinicProfile;
  locales: Record<ForeignLocale, ClinicLocaleDraft>;
}) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const form = useClinicCopies(clinic, locales);
  const labels = {
    name: platform("clinicName"),
    district: platform("district"),
    address: platform("address"),
    description: platform("description"),
  };

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!form.hy.name.trim() || !form.hy.address.trim()) {
      form.setLocale("hy");
      form.setResult(platform("armenianRequired"), true);
      return;
    }
    const phone = armeniaPhone(String(new FormData(event.currentTarget).get("phoneLocal") ?? ""));
    const ok = phone ? await saveClinic(clinicId, form.hy, phone, form.copies) : false;
    form.setResult(ok ? t("saved") : t("saveFailed"), !ok);
  }

  return (
    <form className="grid max-w-xl gap-4 rounded-card border border-line bg-white p-5 shadow-soft" onSubmit={(event) => void onSubmit(event)}>
      <LanguageTabs
        locale={form.locale}
        hint={t("localeHint")}
        labels={{ hy: platform("armenian"), en: platform("english"), ru: platform("russian") }}
        onSelect={form.setLocale}
      />
      <CopyFields copy={shownCopy(form.locale, form.hy, form.copies)} labels={labels} required={form.locale === "hy"} onChange={form.setField} />
      <PhoneField label={platform("phone")} phone={clinic.phone} />
      <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("save")}</button>
      {form.message ? <p className={form.failed ? "m-0 text-danger" : "m-0 text-muted"}>{form.message}</p> : null}
    </form>
  );
}

function useClinicCopies(clinic: ClinicProfile, locales: Record<ForeignLocale, ClinicLocaleDraft>) {
  const [locale, setLocale] = useState<ContentLocale>("hy");
  const [hy, setHy] = useState<ClinicCopy>({
    name: clinic.name,
    district: clinic.district,
    address: clinic.address,
    description: clinic.description,
  });
  const [copies, setCopies] = useState(locales);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  function setField(key: keyof ClinicCopy, value: string): void {
    if (locale === "hy") {
      setHy((current) => ({ ...current, [key]: value }));
      return;
    }
    setCopies((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
  }

  function setResult(next: string, error: boolean): void {
    setMessage(next);
    setFailed(error);
  }

  return { locale, setLocale, hy, copies, setField, message, failed, setResult };
}

function shownCopy(locale: ContentLocale, hy: ClinicCopy, copies: Record<ForeignLocale, ClinicLocaleDraft>): ClinicCopy {
  return locale === "hy" ? hy : copies[locale];
}

function LanguageTabs({
  locale,
  hint,
  labels,
  onSelect,
}: {
  locale: ContentLocale;
  hint: string;
  labels: Record<ContentLocale, string>;
  onSelect: (locale: ContentLocale) => void;
}) {
  const items: ContentLocale[] = ["hy", "en", "ru"];
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2" role="tablist">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={locale === item}
            className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold ${locale === item ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-muted"}`}
            onClick={() => onSelect(item)}
          >
            {labels[item]}
          </button>
        ))}
      </div>
      <p className="m-0 text-sm text-muted">{hint}</p>
    </div>
  );
}

function CopyFields({
  copy,
  labels,
  required,
  onChange,
}: {
  copy: ClinicCopy;
  labels: Record<keyof ClinicCopy, string>;
  required: boolean;
  onChange: (key: keyof ClinicCopy, value: string) => void;
}) {
  const fields = [
    ["name", 80],
    ["district", 80],
    ["address", 160],
  ] as const;
  return (
    <div className="grid gap-3.5">
      {fields.map(([key, max]) => (
        <label className={fieldClass} key={key}>
          {labels[key]}
          <input className={controlClass} maxLength={max} required={required && key !== "district"} value={copy[key]} onChange={(event) => onChange(key, event.target.value)} />
        </label>
      ))}
      <label className={fieldClass}>
        {labels.description}
        <textarea className={`${controlClass} min-h-[96px] resize-y`} maxLength={600} rows={4} value={copy.description} onChange={(event) => onChange("description", event.target.value)} />
      </label>
    </div>
  );
}

async function saveClinic(
  clinicId: string,
  hy: ClinicCopy,
  phone: string,
  copies: Record<ForeignLocale, ClinicLocaleDraft>,
): Promise<boolean> {
  const profile = await send(`/clinics/${clinicId}`, "PATCH", { ...hy, phone });
  const english = await send(`/clinics/${clinicId}/locales`, "PUT", { locale: "en", ...copies.en });
  const russian = await send(`/clinics/${clinicId}/locales`, "PUT", { locale: "ru", ...copies.ru });
  return profile && english && russian;
}

async function send(path: string, method: "PATCH" | "PUT", payload: unknown): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}
