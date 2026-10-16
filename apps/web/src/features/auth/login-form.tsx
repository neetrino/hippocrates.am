"use client";

import { FormEvent, KeyboardEvent, PointerEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { PasswordField } from "@/features/auth/password-field";
import { accountHome } from "@/shared/role-home";

type LoginPayload = {
  data: { id: string; role: string };
};

type FieldOpenEvent = PointerEvent<HTMLInputElement> | KeyboardEvent<HTMLInputElement>;

export function LoginForm() {
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(true);
  const router = useRouter();
  const t = useTranslations("auth");
  const common = useTranslations("common");

  function openFields(event: FieldOpenEvent): void {
    event.currentTarget.readOnly = false;
    setLocked(false);
  }

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
    const next = accountHome(body.data.role);
    router.push(next);
    router.refresh();
  }

  return (
    <form className="grid min-w-0 gap-3" autoComplete="on" onSubmit={(event) => void onSubmit(event)}>
      <label className="field-label">
        {t("email")}
        <input
          name="email"
          type="email"
          placeholder="john.doe@gmail.com"
          required
          readOnly={locked}
          autoComplete="username"
          onPointerDown={openFields}
          onKeyDown={openFields}
          className="field-control-soft"
        />
      </label>
      <PasswordField
        name="password"
        label={t("password")}
        placeholder="••••••••"
        readOnly={locked}
        autoComplete="current-password"
        onPointerDown={openFields}
        onKeyDown={openFields}
        showLabel={t("showPassword")}
        hideLabel={t("hidePassword")}
      />
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-semibold text-accent hover:text-accent-hover">
          {t("forgotPassword")}
        </Link>
      </div>
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button className="btn btn-primary mt-1 w-full" type="submit">
        {t("enter")}
      </button>
    </form>
  );
}
