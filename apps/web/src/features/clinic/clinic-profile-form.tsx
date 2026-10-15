"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { armeniaPhone, PhoneField } from "@/features/auth/phone-field";
import { ClinicCover } from "@/features/clinic/clinic-cover";

export type ClinicProfile = {
  name: string;
  description: string;
  address: string;
  phone: string;
  district: string;
  published?: boolean;
  verificationStatus?: string;
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

export function ClinicIdentityCard({
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
  const live = clinic.published !== false;
  const place = [copy.district, copy.address, clinic.phone].filter(Boolean).join(" · ");
  return (
    <article className="overflow-hidden rounded-card border border-line bg-white shadow-soft">
      <ClinicCover clinicId={clinicId} coverUrl={clinic.coverUrl} name={copy.name} editing={editing} />
      {editing ? (
        <ClinicProfileForm clinicId={clinicId} clinic={clinic} locales={locales} onClose={() => setEditing(false)} />
      ) : (
        <div className="grid gap-3 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="m-0">{copy.name}</h2>
            <span className="flex items-center gap-3">
              {clinic.verificationStatus && clinic.verificationStatus !== "APPROVED" ? (
                <span className="rounded-full bg-[#2a4a47]/8 px-2.5 py-1 text-xs font-semibold text-[#2a4a47]">{t("verifyWaitHint")}</span>
              ) : (
                <span className={live ? "rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white" : "rounded-full bg-sand px-2.5 py-1 text-xs font-semibold text-muted"}>
                  {live ? t("published") : t("hidden")}
                </span>
              )}
              <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => setEditing(true)}>
                {t("edit")}
              </button>
            </span>
          </div>
          {place ? <p className="m-0 text-muted">{place}</p> : null}
          {copy.description ? <p className="m-0 max-w-[42rem] leading-relaxed text-muted">{copy.description}</p> : null}
        </div>
      )}
    </article>
  );
}

function ClinicProfileForm({
  clinicId,
  clinic,
  locales,
  onClose,
}: {
  clinicId: string;
  clinic: ClinicProfile;
  locales: Record<ForeignLocale, ClinicLocaleDraft>;
  onClose: () => void;
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
    if (!phone) {
      form.setResult(t("saveFailed"), true);
      return;
    }
    const ok = await saveClinic(clinicId, form.hy, form.copies, phone, form.published);
    if (ok) window.location.reload();
    else form.setResult(t("saveFailed"), true);
  }

  return (
    <form className="grid gap-4 p-5" onSubmit={(event) => void onSubmit(event)}>
      <LanguageTabs
        locale={form.locale}
        hint={t("localeHint")}
        labels={{ hy: platform("armenian"), en: platform("english"), ru: platform("russian") }}
        onSelect={form.setLocale}
      />
      <CopyFields copy={shownCopy(form.locale, form.hy, form.copies)} labels={labels} required={form.locale === "hy"} onChange={form.setField} />
      <PhoneField label={platform("phone")} phone={clinic.phone} />
      <label className="flex items-center gap-2 text-[0.92rem] font-semibold">
        <input
          type="checkbox"
          checked={form.published}
          disabled={clinic.verificationStatus !== undefined && clinic.verificationStatus !== "APPROVED"}
          onChange={(event) => form.setPublished(event.target.checked)}
        />
        {t("published")}
      </label>
      {clinic.verificationStatus && clinic.verificationStatus !== "APPROVED" ? (
        <p className="m-0 text-sm text-muted">{t("publishedNeedsApproval")}</p>
      ) : null}
      <FormActions failed={form.failed} message={form.message} onClose={onClose} />
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
  const [published, setPublished] = useState(clinic.published !== false);
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

  return { locale, setLocale, hy, copies, published, setPublished, setField, message, failed, setResult };
}

function FormActions({ failed, message, onClose }: { failed: boolean; message: string; onClose: () => void }) {
  const t = useTranslations("desk");
  const common = useTranslations("common");
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary w-fit" type="submit">{t("save")}</button>
        <button className="btn btn-secondary w-fit" type="button" onClick={onClose}>{common("cancel")}</button>
      </div>
      {message ? <p className={failed ? "m-0 text-danger" : "m-0 text-muted"}>{message}</p> : null}
    </>
  );
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
          <input className="field-control" maxLength={max} required={required && key !== "district"} value={copy[key]} onChange={(event) => onChange(key, event.target.value)} />
        </label>
      ))}
      <label className={fieldClass}>
        {labels.description}
        <textarea className="field-control min-h-[96px] resize-y" maxLength={600} rows={4} value={copy.description} onChange={(event) => onChange("description", event.target.value)} />
      </label>
    </div>
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

async function saveClinic(
  clinicId: string,
  hy: ClinicCopy,
  copies: Record<ForeignLocale, ClinicLocaleDraft>,
  phone: string,
  published: boolean,
): Promise<boolean> {
  const profile = await send(`/clinics/${clinicId}`, "PATCH", { ...hy, phone, published });
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
