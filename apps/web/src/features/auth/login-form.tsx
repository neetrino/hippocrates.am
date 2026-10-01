"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PasswordField } from "@/features/auth/password-field";

export function LoginForm() {
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("auth");
  const common = useTranslations("common");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      setError(common("failed"));
      return;
    }
    router.push("/me");
    router.refresh();
  }

  return (
    <form className="auth-form" onSubmit={(event) => void onSubmit(event)}>
      <label className="field">
        {t("email")}
        <input
          name="email"
          type="email"
          placeholder="john.doe@gmail.com"
          required
          autoComplete="email"
        />
      </label>
      <PasswordField
        name="password"
        label={t("password")}
        placeholder="••••••••"
        autoComplete="current-password"
        showLabel={t("showPassword")}
        hideLabel={t("hidePassword")}
      />
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-block btn-auth" type="submit">{t("enter")}</button>
    </form>
  );
}
