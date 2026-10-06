"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type DoctorDraft = { id: string; name: string; displayName: string; specialty: string; bio: string };

type LocaleDraft = {
  name: string;
  district: string;
  address: string;
  description: string;
  doctors: DoctorDraft[];
};

type LocaleCode = "en" | "ru";

export function ClinicLocaleForm({
  clinicId,
  texts,
}: {
  clinicId: string;
  texts: Record<LocaleCode, LocaleDraft>;
}) {
  const t = useTranslations("desk");
  const catalog = useTranslations("catalog");
  const common = useTranslations("common");
  const platform = useTranslations("platform");
  const [locale, setLocale] = useState<LocaleCode>("en");
  const [drafts, setDrafts] = useState(texts);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const draft = drafts[locale];

  function setClinicField(key: "name" | "district" | "address" | "description", value: string): void {
    setDrafts((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
  }

  function setDoctorField(id: string, key: "displayName" | "specialty" | "bio", value: string): void {
    setDrafts((current) => ({
      ...current,
      [locale]: {
        ...current[locale],
        doctors: current[locale].doctors.map((doctor) => (doctor.id === id ? { ...doctor, [key]: value } : doctor)),
      },
    }));
  }

  async function save(): Promise<void> {
    setMessage("");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics/${clinicId}/locales`, {
      method: "PUT",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ locale, ...draft }),
    });
    setFailed(!response.ok);
    setMessage(response.ok ? t("localeSaved") : t("localeFailed"));
  }

  const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
  const controlClass =
    "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

  return (
    <section className="grid gap-4 rounded-card border border-line bg-white p-5 shadow-soft">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0">{t("localeTexts")}</h2>
          <p className="mt-1 mb-0 text-sm text-muted">{t("localeHint")}</p>
        </div>
        <div className="flex gap-2">
          <LocaleTab active={locale === "en"} label={t("english")} onClick={() => setLocale("en")} />
          <LocaleTab active={locale === "ru"} label={t("russian")} onClick={() => setLocale("ru")} />
        </div>
      </div>
      <label className={fieldClass}>
        {t("latinName")}
        <input className={controlClass} maxLength={80} value={draft.name} onChange={(event) => setClinicField("name", event.target.value)} />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className={fieldClass}>
          {catalog("city")}
          <input className={controlClass} maxLength={80} value={draft.district} onChange={(event) => setClinicField("district", event.target.value)} />
        </label>
        <label className={fieldClass}>
          {platform("address")}
          <input className={controlClass} maxLength={160} value={draft.address} onChange={(event) => setClinicField("address", event.target.value)} />
        </label>
      </div>
      <label className={fieldClass}>
        {t("description")}
        <textarea className={`${controlClass} min-h-[96px] resize-y`} maxLength={600} value={draft.description} onChange={(event) => setClinicField("description", event.target.value)} />
      </label>
      {draft.doctors.map((doctor) => (
        <div className="grid gap-3 border-t border-line pt-4" key={doctor.id}>
          <strong>{doctor.name}</strong>
          <label className={fieldClass}>
            {t("doctorName")}
            <input className={controlClass} maxLength={80} value={doctor.displayName} onChange={(event) => setDoctorField(doctor.id, "displayName", event.target.value)} />
          </label>
          <label className={fieldClass}>
            {catalog("specialty")}
            <input className={controlClass} maxLength={80} value={doctor.specialty} onChange={(event) => setDoctorField(doctor.id, "specialty", event.target.value)} />
          </label>
          <label className={fieldClass}>
            {t("bio")}
            <textarea className={`${controlClass} min-h-[80px] resize-y`} maxLength={600} value={doctor.bio} onChange={(event) => setDoctorField(doctor.id, "bio", event.target.value)} />
          </label>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="btn btn-primary w-fit"
          type="button"
          onClick={() => void save()}
        >
          {common("confirm")}
        </button>
        {message ? <p className={`m-0 text-sm ${failed ? "text-danger" : "text-accent"}`}>{message}</p> : null}
      </div>
    </section>
  );
}

function LocaleTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold ${active ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-muted"}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
