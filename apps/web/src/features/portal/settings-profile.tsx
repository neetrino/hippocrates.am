"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { PasswordField } from "@/features/auth/password-field";
import { armeniaPhone, localArmeniaDigits, PhoneField } from "@/features/auth/phone-field";
import { accountRequest } from "@/features/portal/settings-request";
import { sanitizeNameInput } from "@/shared/input-constraints";

const labelClass = "grid gap-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase";
const inputClass =
  "rounded-xl border border-line bg-white px-3.5 py-3 text-base font-normal tracking-normal text-ink normal-case";
const outlineButton =
  "inline-flex w-fit cursor-pointer items-center justify-center rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent disabled:opacity-60";
const confirmButton =
  "btn btn-primary min-h-9 px-3.5 py-2 text-sm";

type SettingsProfileProps = {
  displayName: string;
  email: string;
  phone: string | null;
  editing: boolean;
  onCancel: () => void;
  onSaved: () => void;
};

export function SettingsProfile({ displayName, email, phone, editing, onCancel, onSaved }: SettingsProfileProps) {
  const t = useTranslations("me");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const router = useRouter();
  const parts = splitDisplayName(displayName);
  const [emailValue, setEmailValue] = useState(email);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [snapshot, setSnapshot] = useState({ email, editing });
  if (snapshot.email !== email || snapshot.editing !== editing) {
    setSnapshot({ email, editing });
    setEmailValue(email);
    if (editing) setSaved(false);
  }
  const emailChanged = emailValue.trim().toLowerCase() !== email.trim().toLowerCase();

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const surname = String(form.get("surname") ?? "").trim();
    const nextEmail = emailValue.trim();
    const currentPassword = String(form.get("currentPassword") ?? "");
    const local = String(form.get("phoneLocal") ?? "");
    const problem = profileProblem(
      { name, surname, email: nextEmail, emailChanged, currentPassword, local },
      t,
      auth,
    );
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    const result = await accountRequest("/auth/me", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        surname,
        email: nextEmail,
        phone: local.replace(/\D/g, "").length === 0 ? null : armeniaPhone(local),
        ...(emailChanged ? { currentPassword } : {}),
      }),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.message || t("saveFailed"));
      return;
    }
    setSaved(true);
    onSaved();
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="max-w-xl border-b border-line pb-6">
        <ProfileFacts
          name={parts.name}
          surname={parts.surname}
          email={email}
          phone={formatArmeniaPhone(phone)}
          labels={{ name: t("name"), surname: t("surname"), email: t("email"), phone: t("phone") }}
        />
        {saved ? <p className="m-0 mt-4 text-sm text-accent">{t("saved")}</p> : null}
      </div>
    );
  }

  return (
    <form className="grid max-w-xl gap-4 border-b border-line pb-6" onSubmit={(event) => void onSubmit(event)}>
      <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
        <NameField label={t("name")} name="name" defaultValue={parts.name} autoComplete="given-name" />
        <NameField label={t("surname")} name="surname" defaultValue={parts.surname} autoComplete="family-name" />
      </div>
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
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={busy} onClick={onCancel} className={outlineButton}>
          {common("cancel")}
        </button>
        <button type="submit" disabled={busy} className={confirmButton}>
          {common("confirm")}
        </button>
      </div>
    </form>
  );
}

function ProfileFacts({
  name,
  surname,
  email,
  phone,
  labels,
}: {
  name: string;
  surname: string;
  email: string;
  phone: string;
  labels: { name: string; surname: string; email: string; phone: string };
}) {
  return (
    <dl className="m-0 grid grid-cols-2 gap-x-8 gap-y-5 max-sm:grid-cols-1">
      <Fact label={labels.name} value={name || "—"} />
      <Fact label={labels.surname} value={surname || "—"} />
      <Fact label={labels.email} value={email} />
      <Fact label={labels.phone} value={phone} />
    </dl>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <dt className="text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{label}</dt>
      <dd className="m-0 text-base font-normal tracking-normal text-ink normal-case">{value}</dd>
    </div>
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

function formatArmeniaPhone(phone: string | null): string {
  const local = localArmeniaDigits(phone);
  if (!local) return "—";
  if (local.length !== 8) return phone?.trim() || "—";
  return `+374 ${local.slice(0, 2)} ${local.slice(2, 4)} ${local.slice(4, 6)} ${local.slice(6)}`;
}

function profileProblem(
  input: {
    name: string;
    surname: string;
    email: string;
    emailChanged: boolean;
    currentPassword: string;
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
  if (input.local.replace(/\D/g, "").length > 0 && !armeniaPhone(input.local)) return auth("phoneInvalid");
  return null;
}
