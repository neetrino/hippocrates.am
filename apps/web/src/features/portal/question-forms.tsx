"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

export function AskQuestionForm() {
  const [error, setError] = useState("");
  const t = useTranslations("questions");
  const common = useTranslations("common");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: String(form.get("title") ?? ""), body: String(form.get("body") ?? "") }),
    });
    if (!response.ok) {
      setError(t("askFailed"));
      return;
    }
    window.location.reload();
  }

  const fieldClass = "grid gap-1.5 text-[0.92rem] font-semibold";
  const controlClass =
    "rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none";

  return (
    <form className="grid gap-3.5" onSubmit={(event) => void onSubmit(event)}>
      <h2>{t("ask")}</h2>
      <label className={fieldClass}>{t("askTitle")}<input name="title" required className={controlClass} /></label>
      <label className={fieldClass}>{t("askBody")}<textarea name="body" required className={`${controlClass} min-h-[110px] resize-y`} /></label>
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button
        className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent"
        type="submit"
      >
        {common("send")}
      </button>
    </form>
  );
}

export function AnswerForm({ questionId }: { questionId: string }) {
  const [error, setError] = useState("");
  const t = useTranslations("questions");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/questions/${questionId}/answers`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ body: String(form.get("body") ?? "") }),
    });
    if (!response.ok) {
      setError(t("answerFailed"));
      return;
    }
    window.location.reload();
  }

  return (
    <form className="grid gap-3.5" onSubmit={(event) => void onSubmit(event)}>
      <label className="grid gap-1.5 text-[0.92rem] font-semibold">
        {t("answer")}
        <textarea
          name="body"
          required
          className="min-h-[110px] resize-y rounded-xl border border-line bg-white px-3.5 py-3 font-normal focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none"
        />
      </label>
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button
        className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-3.5 py-2 text-sm font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent"
        type="submit"
      >
        {t("answerAction")}
      </button>
    </form>
  );
}
