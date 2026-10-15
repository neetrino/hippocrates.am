"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setPending(true);
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, locale }),
    });
    setPending(false);
    if (!response.ok) {
      setError(t("resetUnavailable"));
      return;
    }
    setSent(true);
  }

  if (sent) return <p className="m-0 text-[0.95rem] leading-relaxed text-ink">{t("forgotSent")}</p>;

  return (
    <form className="grid min-w-0 gap-3" onSubmit={(event) => void onSubmit(event)}>
      <label className="field-label">
        {t("email")}
        <input name="email" type="email" required autoComplete="email" className="field-control-soft" />
      </label>
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button className="btn btn-primary mt-1 w-full" type="submit" disabled={pending}>
        {t("forgotAction")}
      </button>
      <p className="m-0 text-center text-[0.9rem] text-muted">
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-accent">
          {t("goLogin")}
        </Link>
      </p>
    </form>
  );
}
