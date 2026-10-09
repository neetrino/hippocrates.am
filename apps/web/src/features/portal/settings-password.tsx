"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { PasswordField } from "@/features/auth/password-field";
import { accountRequest } from "@/features/portal/settings-request";

const submitClass =
  "btn btn-primary min-h-9 px-3.5 py-2 text-sm";

export function SettingsPassword() {
  const t = useTranslations("me");
  const auth = useTranslations("auth");
  const common = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function showForm(): void {
    setOpen(true);
    setSaved(false);
    setError("");
  }

  function hideForm(): void {
    setOpen(false);
    setError("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const password = String(data.get("password") ?? "");
    const confirm = String(data.get("confirmPassword") ?? "");
    if (password.length < 8) {
      setError(t("passwordShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }
    setBusy(true);
    setError("");
    const result = await accountRequest("/auth/me/password", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        currentPassword: String(data.get("currentPassword") ?? ""),
        password,
        confirmPassword: confirm,
      }),
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.message || t("saveFailed"));
      return;
    }
    form.reset();
    setOpen(false);
    setSaved(true);
  }

  return (
    <section className="grid max-w-xl gap-4 pt-6">
      <h2 className="m-0 font-display text-xl font-bold text-ink">{auth("password")}</h2>
      {saved ? <p className="m-0 text-sm text-accent">{t("passwordSaved")}</p> : null}
      {open ? (
        <form className="grid gap-4" onSubmit={(event) => void onSubmit(event)}>
          <PasswordField
            name="currentPassword"
            label={t("currentPassword")}
            placeholder="••••••••"
            autoComplete="current-password"
            showLabel={auth("showPassword")}
            hideLabel={auth("hidePassword")}
            variant="portal"
          />
          <PasswordField
            name="password"
            label={t("newPassword")}
            placeholder="••••••••"
            autoComplete="new-password"
            showLabel={auth("showPassword")}
            hideLabel={auth("hidePassword")}
            variant="portal"
          />
          <PasswordField
            name="confirmPassword"
            label={t("confirmPassword")}
            placeholder="••••••••"
            autoComplete="new-password"
            showLabel={auth("showPassword")}
            hideLabel={auth("hidePassword")}
            variant="portal"
          />
          {error ? <p className="m-0 text-sm text-danger">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className={submitClass}>
              {t("changePassword")}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={hideForm}
              className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent disabled:opacity-60"
            >
              {common("cancel")}
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={showForm}
          className="inline-flex w-fit cursor-pointer items-center justify-center rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent"
        >
          {t("changePassword")}
        </button>
      )}
    </section>
  );
}
