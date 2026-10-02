"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

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

  const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
  const controlClass =
    "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

  return (
    <form className="grid gap-3.5" onSubmit={(event) => void onSubmit(event)}>
      <label className={fieldClass}>
        {t("rating")}
        <select name="rating" defaultValue="5" className={controlClass}>
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>
      <label className={fieldClass}>
        {t("review")}
        <textarea name="body" required className={`${controlClass} min-h-[110px] resize-y`} />
      </label>
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button
        className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent"
        type="submit"
      >
        {t("sendReview")}
      </button>
    </form>
  );
}
