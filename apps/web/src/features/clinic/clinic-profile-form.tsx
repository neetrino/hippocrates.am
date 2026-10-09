"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { PhoneField, armeniaPhone } from "@/features/auth/phone-field";
import { ClinicCover } from "@/features/clinic/clinic-cover";
import { clinicSend } from "@/features/clinic/clinic-api";

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

export function ClinicProfilePanel({
  clinicId,
  clinic,
  locales,
}: {
  clinicId: string;
  clinic: ClinicProfile;
  locales: Record<ForeignLocale, ClinicLocaleDraft>;
}) {
  const t = useTranslations("desk");
  const [editing, setEditing] = useState(false);
  const copy = visibleCopy(useLocale(), clinic, locales);
  return (
    <div className="grid max-w-xl gap-8">
      <div className="grid gap-4">
        <button className="w-fit cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => setEditing((value) => !value)}>{t("edit")}</button>
        <ClinicCover clinicId={clinicId} coverUrl={clinic.coverUrl} name={copy.name} editing={editing} />
        {editing ? <ClinicProfileForm clinicId={clinicId} clinic={clinic} locales={locales} /> : <ClinicProfileRead copy={copy} />}
      </div>
      <ClinicPhoneForm clinicId={clinicId} phone={clinic.phone} />
    </div>
  );
}

function ClinicProfileRead({ copy }: { copy: ClinicCopy }) {
  return (
    <div className="grid gap-2">
      <h2 className="m-0">{copy.name}</h2>
      {copy.district ? <p className="m-0 text-muted">{copy.district}</p> : null}
      <p className="m-0">{copy.address}</p>
      {copy.description ? <p className="m-0 max-w-[42rem] leading-relaxed text-muted">{copy.description}</p> : null}
    </div>
  );
}

function ClinicProfileForm({
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
    const ok = await saveClinic(clinicId, form.hy, form.copies);
    if (ok) window.location.reload();
    else form.setResult(t("saveFailed"), true);
  }

  return (
    <form className="grid gap-4 rounded-card border border-line bg-white p-5 shadow-soft" onSubmit={(event) => void onSubmit(event)}>
      <LanguageTabs
        locale={form.locale}
        hint={t("localeHint")}
        labels={{ hy: platform("armenian"), en: platform("english"), ru: platform("russian") }}
        onSelect={form.setLocale}
      />
      <CopyFields copy={shownCopy(form.locale, form.hy, form.copies)} labels={labels} required={form.locale === "hy"} onChange={form.setField} />
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

function ClinicPhoneForm({ clinicId, phone }: { clinicId: string; phone: string }) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const [failed, setFailed] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const next = armeniaPhone(String(new FormData(event.currentTarget).get("phoneLocal") ?? ""));
    if (!next) {
      setFailed(true);
      return;
    }
    const ok = await clinicSend(`/clinics/${clinicId}`, "PATCH", { phone: next });
    if (ok) window.location.reload();
    else setFailed(true);
  }

  return (
    <form className="grid gap-4 rounded-card border border-line bg-white p-5 shadow-soft" onSubmit={(event) => void onSubmit(event)}>
      <PhoneField label={platform("phone")} phone={phone} />
      <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("save")}</button>
      {failed ? <p className="m-0 text-danger">{t("saveFailed")}</p> : null}
    </form>
  );
}

function visibleCopy(locale: string, clinic: ClinicProfile, locales: Record<ForeignLocale, ClinicLocaleDraft>): ClinicCopy {
  const source = locale === "en" || locale === "ru" ? locales[locale] : null;
  return {
    name: filled(source?.name, clinic.name),
    district: filled(source?.district, clinic.district),
    address: filled(source?.address, clinic.address),
    description: filled(source?.description, clinic.description),
  };
}

function filled(value: string | undefined, base: string): string {
  const text = value?.trim() ?? "";
  return text || base;
}

async function saveClinic(clinicId: string, hy: ClinicCopy, copies: Record<ForeignLocale, ClinicLocaleDraft>): Promise<boolean> {
  const profile = await send(`/clinics/${clinicId}`, "PATCH", hy);
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
