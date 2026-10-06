"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PasswordField } from "@/features/auth/password-field";

type LoginPayload = {
  data: { id: string; role: string };
};

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
    const body = (await response.json()) as LoginPayload;
    const next = body.data.role === "SUPER_ADMIN" ? "/super-admin" : "/me";
    router.push(next);
    router.refresh();
  }

  return (
    <form className="grid min-w-0 gap-3" onSubmit={(event) => void onSubmit(event)}>
      <label className="field-label">
        {t("email")}
        <input
          name="email"
          type="email"
          placeholder="john.doe@gmail.com"
          required
          autoComplete="email"
          className="field-control-soft"
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
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button className="btn btn-primary mt-1 w-full" type="submit">
        {t("enter")}
      </button>
    </form>
  );
}
