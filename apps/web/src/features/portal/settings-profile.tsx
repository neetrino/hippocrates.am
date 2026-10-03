"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PasswordField } from "@/features/auth/password-field";
import { readPhone, toE164 } from "@/features/auth/phone-countries";
import { PhoneField } from "@/features/auth/phone-field";
import { accountRequest } from "@/features/portal/settings-request";
import { sanitizeNameInput } from "@/shared/input-constraints";

const labelClass = "grid gap-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase";
const inputClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 text-base font-normal tracking-normal text-ink normal-case";

type SettingsProfileProps = {
  displayName: string;
  email: string;
  phone: string | null;
};

export function SettingsProfile({ displayName, email, phone }: SettingsProfileProps) {
  const t = useTranslations("me");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const router = useRouter();
  const parts = splitDisplayName(displayName);
  const [emailValue, setEmailValue] = useState(email);
  useEffect(() => {
    setEmailValue(email);
  }, [email]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const emailChanged = emailValue.trim().toLowerCase() !== email.trim().toLowerCase();

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const surname = String(form.get("surname") ?? "").trim();
    const nextEmail = emailValue.trim();
    const currentPassword = String(form.get("currentPassword") ?? "");
    const entered = readPhone(form);
    const problem = profileProblem(
      { name, surname, email: nextEmail, emailChanged, currentPassword, iso: entered.iso, local: entered.local },
      t,
      auth,
    );
    if (problem) {
      setSaved(false);
      setError(problem);
      return;
    }
    const e164 = entered.local.length === 0 ? null : toE164(entered.iso, entered.local);
    setBusy(true);
    setError("");
    setSaved(false);
    const result = await accountRequest("/auth/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        surname,
        email: nextEmail,
        phone: e164,
        ...(emailChanged ? { currentPassword } : {}),
      }),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.message || t("saveFailed"));
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form className="grid max-w-xl gap-4 border-b border-line pb-6" onSubmit={(event) => void onSubmit(event)}>
      <NameField label={t("name")} name="name" defaultValue={parts.name} autoComplete="given-name" />
      <NameField label={t("surname")} name="surname" defaultValue={parts.surname} autoComplete="family-name" />
      <label className={labelClass}>
        {t("email")}
        <input
          name="email"
          type="email"
          value={emailValue}
          autoComplete="email"
          className={inputClass}
          onChange={(event) => setEmailValue(event.target.value)}
        />
      </label>
      {emailChanged ? (
        <PasswordField
          name="currentPassword"
          label={t("currentPassword")}
          placeholder="••••••••"
          autoComplete="current-password"
          showLabel={auth("showPassword")}
          hideLabel={auth("hidePassword")}
          variant="portal"
        />
      ) : null}
      <PhoneField label={t("phone")} variant="settings" phone={phone} required={false} />
      {error ? <p className="m-0 text-sm font-normal tracking-normal text-danger normal-case">{error}</p> : null}
      {saved ? <p className="m-0 text-sm font-normal tracking-normal text-accent normal-case">{t("saved")}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-3.5 py-2 text-sm font-semibold tracking-normal text-white normal-case transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent disabled:opacity-60"
      >
        {common("confirm")}
      </button>
    </form>
  );
}

function NameField({
  label,
  name,
  defaultValue,
  autoComplete,
}: {
  label: string;
  name: string;
  defaultValue: string;
  autoComplete: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        name={name}
        type="text"
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className={inputClass}
        onInput={(event) => {
          event.currentTarget.value = sanitizeNameInput(event.currentTarget.value);
        }}
      />
    </label>
  );
}

function splitDisplayName(displayName: string): { name: string; surname: string } {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  return { name: parts[0] ?? "", surname: parts.slice(1).join(" ") };
}

function profileProblem(
  input: {
    name: string;
    surname: string;
    email: string;
    emailChanged: boolean;
    currentPassword: string;
    iso: string;
    local: string;
  },
  t: (key: "nameRequired" | "surnameRequired" | "emailRequired" | "emailInvalid" | "emailPasswordRequired") => string,
  auth: (key: "phoneInvalid") => string,
): string | null {
  if (!input.name) return t("nameRequired");
  if (!input.surname) return t("surnameRequired");
  if (!input.email) return t("emailRequired");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) return t("emailInvalid");
  if (input.emailChanged && input.currentPassword.trim() === "") return t("emailPasswordRequired");
  if (input.local.length > 0 && !toE164(input.iso, input.local)) return auth("phoneInvalid");
  return null;
}
