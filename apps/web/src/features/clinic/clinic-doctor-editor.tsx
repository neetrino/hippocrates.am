"use client";

import { FormEvent, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { PatientAvatar } from "@/features/portal/patient-avatar";
import { acceptedImage, clinicImage, clinicSend } from "@/features/clinic/clinic-api";

type Copy = { displayName: string; specialty: string; bio: string };
type ContentLocale = "hy" | "en" | "ru";

export type DoctorRow = {
  id: string;
  specialty: string;
  bio: string;
  photoUrl: string | null;
  user: { displayName: string };
  locales: { locale: string; name: string; specialty: string; bio: string }[];
};

export type DoctorDraft = {
  id: string;
  displayName: string;
  specialty: string;
  bio: string;
  photoUrl: string | null;
  en: Copy;
  ru: Copy;
};

const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function toDoctorDraft(doctor: DoctorRow): DoctorDraft {
  return {
    id: doctor.id,
    displayName: doctor.user.displayName,
    specialty: doctor.specialty,
    bio: doctor.bio,
    photoUrl: doctor.photoUrl,
    en: copyOf(doctor, "en"),
    ru: copyOf(doctor, "ru"),
  };
}

export function DoctorList({ clinicId, doctors }: { clinicId: string; doctors: DoctorRow[] }) {
  return (
    <div className="grid gap-3">
      {doctors.map((doctor) => (
        <DoctorCard clinicId={clinicId} doctor={toDoctorDraft(doctor)} key={doctor.id} />
      ))}
    </div>
  );
}

function DoctorCard({ clinicId, doctor }: { clinicId: string; doctor: DoctorDraft }) {
  const t = useTranslations("desk");
  const [open, setOpen] = useState(false);
  return (
    <article className="rounded-[14px] border border-line bg-white">
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <span className="flex min-w-0 items-center gap-3">
          <PatientAvatar name={doctor.displayName} photoUrl={doctor.photoUrl} />
          <span className="grid min-w-0">
            <span className="font-semibold">{doctor.displayName}</span>
            <span className="text-sm text-muted">{doctor.specialty}</span>
          </span>
        </span>
        <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => setOpen((value) => !value)}>
          {t("edit")}
        </button>
      </div>
      {open ? <DoctorForm clinicId={clinicId} doctor={doctor} /> : null}
    </article>
  );
}

function DoctorForm({ clinicId, doctor }: { clinicId: string; doctor: DoctorDraft }) {
  const t = useTranslations("desk");
  const platform = useTranslations("platform");
  const common = useTranslations("common");
  const catalog = useTranslations("catalog");
  const form = useDoctorCopies(doctor);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!form.hy.displayName.trim() || !form.hy.specialty.trim()) {
      form.setLocale("hy");
      form.setResult(t("doctorArmenianRequired"), true);
      return;
    }
    const ok = await saveDoctor(clinicId, doctor.id, form.hy, form.copies);
    if (ok) window.location.reload();
    else form.setResult(t("saveFailed"), true);
  }

  const copy = form.locale === "hy" ? form.hy : form.copies[form.locale];
  return (
    <form className="grid gap-3.5 border-t border-line px-4 py-4" onSubmit={(event) => void onSubmit(event)}>
      <LocaleTabs
        locale={form.locale}
        labels={{ hy: platform("armenian"), en: platform("english"), ru: platform("russian") }}
        onSelect={form.setLocale}
      />
      <p className="m-0 text-sm text-muted">{t("localeHint")}</p>
      <DoctorPhoto clinicId={clinicId} doctorId={doctor.id} name={doctor.displayName} photoUrl={doctor.photoUrl} />
      <label className={fieldClass}>
        {common("name")}
        <input className={controlClass} maxLength={80} required={form.locale === "hy"} value={copy.displayName} onChange={(event) => form.setField("displayName", event.target.value)} />
      </label>
      <label className={fieldClass}>
        {catalog("specialty")}
        <input className={controlClass} maxLength={80} required={form.locale === "hy"} value={copy.specialty} onChange={(event) => form.setField("specialty", event.target.value)} />
      </label>
      <label className={fieldClass}>
        {t("bio")}
        <textarea className={`${controlClass} min-h-[96px] resize-y`} maxLength={600} rows={4} value={copy.bio} onChange={(event) => form.setField("bio", event.target.value)} />
      </label>
      <button className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white" type="submit">{t("save")}</button>
      {form.message ? <p className={form.failed ? "m-0 text-danger" : "m-0 text-muted"}>{form.message}</p> : null}
    </form>
  );
}

function DoctorPhoto({
  clinicId,
  doctorId,
  name,
  photoUrl,
}: {
  clinicId: string;
  doctorId: string;
  name: string;
  photoUrl: string | null;
}) {
  const me = useTranslations("me");
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  async function onFile(file: File | undefined): Promise<void> {
    if (!file) return;
    if (!acceptedImage(file)) {
      setMessage(me("photoInvalid"));
      return;
    }
    const ok = await clinicImage(`/clinics/${clinicId}/doctors/${doctorId}/photo`, "POST", file);
    if (ok) window.location.reload();
    else setMessage(me("photoFailed"));
  }

  async function remove(): Promise<void> {
    const ok = await clinicImage(`/clinics/${clinicId}/doctors/${doctorId}/photo`, "DELETE");
    if (ok) window.location.reload();
    else setMessage(me("photoFailed"));
  }

  return (
    <div className="flex items-center gap-3">
      <PatientAvatar name={name} photoUrl={photoUrl} className="h-16 w-16 text-lg" />
      <input ref={input} accept="image/jpeg,image/png,image/webp" className="hidden" type="file" onChange={(event) => void onFile(event.target.files?.[0])} />
      <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => input.current?.click()}>{me("photoChange")}</button>
      {photoUrl ? <button className="cursor-pointer text-sm font-semibold text-danger" type="button" onClick={() => void remove()}>{me("photoDelete")}</button> : null}
      {message ? <p className="m-0 text-sm text-danger">{message}</p> : null}
    </div>
  );
}

function LocaleTabs({
  locale,
  labels,
  onSelect,
}: {
  locale: ContentLocale;
  labels: Record<ContentLocale, string>;
  onSelect: (locale: ContentLocale) => void;
}) {
  const items: ContentLocale[] = ["hy", "en", "ru"];
  return (
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
  );
}

function useDoctorCopies(doctor: DoctorDraft) {
  const [locale, setLocale] = useState<ContentLocale>("hy");
  const [hy, setHy] = useState<Copy>({ displayName: doctor.displayName, specialty: doctor.specialty, bio: doctor.bio });
  const [copies, setCopies] = useState({ en: doctor.en, ru: doctor.ru });
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  function setField(key: keyof Copy, value: string): void {
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

function copyOf(doctor: DoctorRow, locale: "en" | "ru"): Copy {
  const row = doctor.locales.find((item) => item.locale === locale);
  return { displayName: row?.name ?? "", specialty: row?.specialty ?? "", bio: row?.bio ?? "" };
}

async function saveDoctor(clinicId: string, doctorId: string, hy: Copy, copies: { en: Copy; ru: Copy }): Promise<boolean> {
  const profile = await clinicSend(`/clinics/${clinicId}/doctors/${doctorId}`, "PATCH", hy);
  const english = await clinicSend(`/clinics/${clinicId}/doctors/${doctorId}/locales`, "PUT", { locale: "en", ...copies.en });
  const russian = await clinicSend(`/clinics/${clinicId}/doctors/${doctorId}/locales`, "PUT", { locale: "ru", ...copies.ru });
  return profile && english && russian;
}
