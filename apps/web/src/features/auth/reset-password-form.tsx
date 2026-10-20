"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { PasswordField } from "@/features/auth/password-field";
import { passwordIssue } from "@/features/auth/password-rule";
import { Link } from "@/i18n/navigation";

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (passwordIssue(password) === "weak") {
      setError(t("passwordShort"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }
    setPending(true);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword }),
    });
    setPending(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: { code?: string } } | null;
      const code = body?.error?.code;
      if (code === "RESET_INVALID") setError(t("resetInvalid"));
      else if (code === "VALIDATION_FAILED") setError(t("passwordShort"));
      else setError(t("resetUnavailable"));
      return;
    }
    setDone(true);
  }

  if (!token) return <p className="m-0 text-danger">{t("resetInvalid")}</p>;
  if (done) {
    return (
      <p className="m-0 text-[0.95rem] leading-relaxed text-ink">
        {t("resetDone")}{" "}
        <Link href="/login" className="font-semibold underline underline-offset-4 hover:text-accent">
          {t("goLogin")}
        </Link>
      </p>
    );
  }

  return (
    <form className="grid min-w-0 gap-3" onSubmit={(event) => void onSubmit(event)}>
      <PasswordField
        name="password"
        label={t("newPassword")}
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
      <p className="m-0 text-sm text-muted">{t("passwordShort")}</p>
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button className="btn btn-primary mt-1 w-full" type="submit" disabled={pending}>
        {t("resetAction")}
      </button>
    </form>
  );
}
