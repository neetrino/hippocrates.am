"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { PasswordField } from "@/features/auth/password-field";
import { armeniaPhone, PhoneField } from "@/features/auth/phone-field";
import { sanitizeNameInput } from "@/shared/input-constraints";

export function RegisterForm() {
  const [error, setError] = useState("");
  const locale = useLocale();
  const t = useTranslations("auth");
  const common = useTranslations("common");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const surname = String(form.get("surname") ?? "").trim();
    const phone = armeniaPhone(String(form.get("phoneLocal") ?? ""));
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (!phone) {
      setError(t("phoneInvalid"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, surname, phone, email, password, confirmPassword }),
    });
    if (!response.ok) {
      setError(common("failed"));
      return;
    }
    window.location.assign(getPathname({ locale, href: "/me" }));
  }

  const fieldClass = "field-label";
  const inputClass = "field-control-soft";

  return (
    <form className="grid min-w-0 gap-3" onSubmit={(event) => void onSubmit(event)}>
      <div className="grid min-w-0 grid-cols-2 gap-2.5 max-sm:grid-cols-1">
        <label className={fieldClass}>
          {t("name")}
          <input
            name="name"
            type="text"
            placeholder="John"
            required
            autoComplete="given-name"
            className={inputClass}
            onInput={(event) => {
              event.currentTarget.value = sanitizeNameInput(event.currentTarget.value);
            }}
          />
        </label>
        <label className={fieldClass}>
          {t("surname")}
          <input
            name="surname"
            type="text"
            placeholder="Doe"
            required
            autoComplete="family-name"
            className={inputClass}
            onInput={(event) => {
              event.currentTarget.value = sanitizeNameInput(event.currentTarget.value);
            }}
          />
        </label>
      </div>
      <PhoneField label={t("phone")} variant="auth" />
      <label className={fieldClass}>
        {t("email")}
        <input name="email" type="email" placeholder="john.doe@gmail.com" required autoComplete="email" className={inputClass} />
      </label>
      <div className="grid min-w-0 grid-cols-2 gap-2.5 max-sm:grid-cols-1">
        <PasswordField
          name="password"
          label={t("password")}
          placeholder="••••••••"
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />
        <PasswordField
          name="confirmPassword"
          label={t("confirmPassword")}
          placeholder="••••••••"
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
        />
      </div>
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button className="btn btn-primary mt-1 w-full" type="submit">
        {t("registerAction")}
      </button>
    </form>
  );
}
