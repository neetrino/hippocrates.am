"use client";

import { FormEvent, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { armeniaPhone, PhoneField } from "@/features/auth/phone-field";
import { useRouter } from "@/i18n/navigation";
import { sanitizeNameInput } from "@/shared/input-constraints";
import { cn } from "@/shared/ui/cn";

const LOCALES = ["hy", "en", "ru"] as const;
type ContentLocale = (typeof LOCALES)[number];
type Copy = { name: string; district: string; address: string; description: string };

const EMPTY: Copy = { name: "", district: "", address: "", description: "" };

const EXAMPLES: Record<ContentLocale, Pick<Copy, "name" | "district" | "address">> = {
  hy: { name: "օր. Արեգ Ստոմատոլոգիա", district: "օր. Կենտրոն", address: "օր. Աբովյան 18, Երևան" },
  en: { name: "e.g. Areg Dental", district: "e.g. Center", address: "e.g. 18 Abovyan, Yerevan" },
  ru: { name: "напр. Арег Стоматология", district: "напр. Кентрон", address: "напр. Абовяна 18, Ереван" },
};

const controlClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 font-normal placeholder:text-[#9aa6a5] focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

export function RegisterClinicForm({ submitLabel }: { submitLabel: string }) {
  const platform = useTranslations("platform");
  const form = useClinicDraft(platform("armenianRequired"));
  return (
    <form className="grid gap-3.5" onSubmit={(event) => void form.onSubmit(event)}>
      <LocaleTabs locale={form.locale} labels={form.labels} hint={platform("localeHint")} onSelect={form.setLocale} />
      <CopyFields
        copy={form.copies[form.locale]}
        examples={EXAMPLES[form.locale]}
        required={form.locale === "hy"}
        nameLabel={platform("clinicName")}
        districtLabel={platform("district")}
        addressLabel={platform("address")}
        descriptionLabel={platform("description")}
        onChange={form.setField}
      />
      <AccountFields
        phone={platform("phone")}
        adminName={platform("adminName")}
        adminNamePlaceholder={platform("adminNamePlaceholder")}
        adminEmail={platform("adminEmail")}
        adminEmailPlaceholder={platform("adminEmailPlaceholder")}
        adminPassword={platform("adminPassword")}
        adminPasswordPlaceholder={platform("adminPasswordPlaceholder")}
      />
      {form.error ? <p className="m-0 text-danger">{form.error}</p> : null}
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent"
        type="submit"
      >
        {submitLabel}
      </button>
    </form>
  );
}

function useClinicDraft(armenianRequired: string) {
  const common = useTranslations("common");
  const auth = useTranslations("auth");
  const platform = useTranslations("platform");
  const router = useRouter();
  const [locale, setLocale] = useState<ContentLocale>("hy");
  const [copies, setCopies] = useState<Record<ContentLocale, Copy>>({
    hy: { ...EMPTY },
    en: { ...EMPTY },
    ru: { ...EMPTY },
  });
  const [error, setError] = useState("");

  function setField(key: keyof Copy, value: string): void {
    setCopies((current) => ({ ...current, [locale]: { ...current[locale], [key]: value } }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const failure = await submitDraft(event.currentTarget, copies, auth("phoneInvalid"), common("failed"));
    if (failure === "armenian") {
      setLocale("hy");
      setError(armenianRequired);
      return;
    }
    if (failure) {
      setError(failure);
      return;
    }
    router.push("/super-admin/clinics");
    router.refresh();
  }

  return {
    locale,
    setLocale,
    copies,
    setField,
    error,
    onSubmit,
    labels: { hy: platform("armenian"), en: platform("english"), ru: platform("russian") },
  };
}

function LocaleTabs(props: {
  locale: ContentLocale;
  labels: Record<ContentLocale, string>;
  hint: string;
  onSelect: (locale: ContentLocale) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap gap-2" role="tablist">
        {LOCALES.map((item) => (
          <LocaleTab key={item} active={props.locale === item} label={props.labels[item]} onClick={() => props.onSelect(item)} />
        ))}
      </div>
      <p className="m-0 text-sm text-muted">{props.hint}</p>
    </div>
  );
}

function AccountFields(props: {
  phone: string;
  adminName: string;
  adminNamePlaceholder: string;
  adminEmail: string;
  adminEmailPlaceholder: string;
  adminPassword: string;
  adminPasswordPlaceholder: string;
}) {
  return (
    <div className="grid gap-3.5 border-t border-line pt-4">
      <PhoneField label={props.phone} />
      <TextField label={props.adminName} name="adminName" placeholder={props.adminNamePlaceholder} nameInput />
      <TextField label={props.adminEmail} name="adminEmail" type="email" placeholder={props.adminEmailPlaceholder} />
      <TextField label={props.adminPassword} name="adminPassword" type="password" placeholder={props.adminPasswordPlaceholder} minLength={8} />
    </div>
  );
}

async function submitDraft(
  form: HTMLFormElement,
  copies: Record<ContentLocale, Copy>,
  phoneInvalid: string,
  failed: string,
): Promise<string | null> {
  const hy = trimCopy(copies.hy);
  if (!hy.name || !hy.address) return "armenian";
  const data = new FormData(form);
  const phone = armeniaPhone(String(data.get("phoneLocal") ?? ""));
  if (!phone) return phoneInvalid;
  const en = filledCopy(copies.en);
  const ru = filledCopy(copies.ru);
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/clinics`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...hy,
      phone,
      adminName: String(data.get("adminName") ?? ""),
      adminEmail: String(data.get("adminEmail") ?? ""),
      adminPassword: String(data.get("adminPassword") ?? ""),
      locales: { ...(en ? { en } : {}), ...(ru ? { ru } : {}) },
    }),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    return body?.error?.message || failed;
  }
  return null;
}

function CopyFields(props: {
  copy: Copy;
  examples: Pick<Copy, "name" | "district" | "address">;
  required: boolean;
  nameLabel: string;
  districtLabel: string;
  addressLabel: string;
  descriptionLabel: string;
  onChange: (key: keyof Copy, value: string) => void;
}) {
  return (
    <>
      <Field label={props.nameLabel}>
        <input
          className={controlClass}
          maxLength={80}
          required={props.required}
          placeholder={props.examples.name}
          value={props.copy.name}
          onChange={(event) => props.onChange("name", sanitizeNameInput(event.target.value))}
        />
      </Field>
      <Field label={props.districtLabel}>
        <input
          className={controlClass}
          maxLength={80}
          placeholder={props.examples.district}
          value={props.copy.district}
          onChange={(event) => props.onChange("district", event.target.value)}
        />
      </Field>
      <Field label={props.addressLabel}>
        <input
          className={controlClass}
          maxLength={160}
          required={props.required}
          placeholder={props.examples.address}
          value={props.copy.address}
          onChange={(event) => props.onChange("address", event.target.value)}
        />
      </Field>
      <Field label={props.descriptionLabel}>
        <textarea
          className={cn(controlClass, "min-h-[96px] resize-y")}
          maxLength={600}
          value={props.copy.description}
          onChange={(event) => props.onChange("description", event.target.value)}
        />
      </Field>
    </>
  );
}

function TextField(props: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  minLength?: number;
  nameInput?: boolean;
}) {
  return (
    <Field label={props.label}>
      <input
        className={controlClass}
        name={props.name}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        minLength={props.minLength}
        required
        onInput={
          props.nameInput
            ? (event) => {
                event.currentTarget.value = sanitizeNameInput(event.currentTarget.value);
              }
            : undefined
        }
      />
    </Field>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-[0.92rem] font-semibold">
      {label}
      {children}
    </label>
  );
}

function LocaleTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "cursor-pointer rounded-full border px-3.5 py-2 text-sm font-semibold",
        active ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-muted",
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function trimCopy(copy: Copy): Copy {
  return {
    name: copy.name.trim(),
    district: copy.district.trim(),
    address: copy.address.trim(),
    description: copy.description.trim(),
  };
}

function filledCopy(copy: Copy): Copy | null {
  const text = trimCopy(copy);
  if (!text.name && !text.district && !text.address && !text.description) return null;
  return text;
}
