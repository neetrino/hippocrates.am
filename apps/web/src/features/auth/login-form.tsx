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
      <label className="grid w-full min-w-0 gap-1.5 text-[0.86rem] font-semibold">
        {t("email")}
        <input
          name="email"
          type="email"
          placeholder="john.doe@gmail.com"
          required
          autoComplete="email"
          className="w-full min-w-0 rounded-[14px] border-0 bg-auth-field px-3 py-[11px] text-[0.92rem] font-normal placeholder:text-[#9aa6a5] focus:bg-auth-field-focus focus:shadow-[0_0_0_3px_rgba(0,167,157,0.18)] focus:outline-none"
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
      <button
        className="mt-0.5 inline-flex min-h-11 w-full max-w-full cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 text-[0.84rem] font-semibold tracking-[0.05em] text-white uppercase shadow-[0_10px_20px_rgba(0,167,157,0.18)] transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-[0_12px_24px_rgba(0,167,157,0.24)]"
        type="submit"
      >
        {t("enter")}
      </button>
    </form>
  );
}
