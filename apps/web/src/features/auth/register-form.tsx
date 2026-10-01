"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PasswordField } from "@/features/auth/password-field";
import { PhoneField, buildPhoneNumber } from "@/features/auth/phone-field";

export function RegisterForm() {
  const [error, setError] = useState("");
  const router = useRouter();
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
    router.push("/");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={(event) => void onSubmit(event)}>
      <div className="field-row">
        <label className="field">
          {t("name")}
          <input
            name="name"
            type="text"
            placeholder="John"
            required
            autoComplete="given-name"
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/[^\p{L}]/gu, "");
            }}
          />
        </label>
        <label className="field">
          {t("surname")}
          <input
            name="surname"
            type="text"
            placeholder="Doe"
            required
            autoComplete="family-name"
            onInput={(event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/[^\p{L}]/gu, "");
            }}
          />
        </label>
      </div>
      <PhoneField label={t("phone")} />
      <label className="field">
        {t("email")}
        <input name="email" type="email" placeholder="john.doe@gmail.com" required autoComplete="email" />
      </label>
      <div className="field-row">
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
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-block btn-auth" type="submit">{t("registerAction")}</button>
    </form>
  );
}
