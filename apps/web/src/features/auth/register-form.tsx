"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

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
    const phone = String(form.get("phone") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
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
    <form className="stack" onSubmit={(event) => void onSubmit(event)}>
      <div className="field-row">
        <label className="field">
          {t("name")}
          <input name="name" type="text" placeholder="John" required autoComplete="given-name" />
        </label>
        <label className="field">
          {t("surname")}
          <input name="surname" type="text" placeholder="Doe" required autoComplete="family-name" />
        </label>
      </div>
      <label className="field">
        {t("phone")}
        <input name="phone" type="tel" placeholder="+374 91 123 456" required autoComplete="tel" />
      </label>
      <label className="field">
        {t("email")}
        <input name="email" type="email" placeholder="john.doe@email.com" required autoComplete="email" />
      </label>
      <label className="field">
        {t("password")}
        <input name="password" type="password" placeholder="••••••••" required autoComplete="new-password" />
      </label>
      <label className="field">
        {t("confirmPassword")}
        <input name="confirmPassword" type="password" placeholder="••••••••" required autoComplete="new-password" />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-block" type="submit">{t("registerAction")}</button>
    </form>
  );
}
