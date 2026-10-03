"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { PasswordField } from "@/features/auth/password-field";
import { PhoneField, buildPhoneNumber } from "@/features/auth/phone-field";
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
    const phoneLocal = String(form.get("phoneLocal") ?? "").trim();
    const phone = buildPhoneNumber(phoneLocal);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (phoneLocal.replace(/\D/g, "").length < 6) {
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

  const fieldClass =
    "grid w-full min-w-0 gap-1.5 text-[0.86rem] font-semibold";
  const inputClass =
    "w-full min-w-0 rounded-[14px] border-0 bg-auth-field px-3 py-[11px] text-[0.92rem] font-normal placeholder:text-[#9aa6a5] focus:bg-auth-field-focus focus:shadow-[0_0_0_3px_rgba(0,167,157,0.18)] focus:outline-none";

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
      <button
        className="mt-0.5 inline-flex min-h-11 w-full max-w-full cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 text-[0.84rem] font-semibold tracking-[0.05em] text-white uppercase shadow-[0_10px_20px_rgba(0,167,157,0.18)] transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-[0_12px_24px_rgba(0,167,157,0.24)]"
        type="submit"
      >
        {t("registerAction")}
      </button>
    </form>
  );
}
