"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [error, setError] = useState("");
  const t = useTranslations("me");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        rating: Number(form.get("rating")),
        body: String(form.get("body") ?? ""),
      }),
    });
    if (!response.ok) {
      setError(t("reviewFailed"));
      return;
    }
    window.location.reload();
  }

  return (
    <form className={ui.stack} onSubmit={(event) => void onSubmit(event)}>
      <label className={ui.field}>
        {t("rating")}
        <select name="rating" defaultValue="5">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>
      <label className={ui.field}>
        {t("review")}
        <textarea name="body" required />
      </label>
      {error ? <p className={ui.error}>{error}</p> : null}
      <button className={cx(ui.btn, ui.btnSmall)} type="submit">{t("sendReview")}</button>
    </form>
  );
}
