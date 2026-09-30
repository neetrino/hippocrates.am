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

  return (
    <form className="stack" onSubmit={(event) => void onSubmit(event)}>
      <h2>{t("ask")}</h2>
      <label className="field">{t("askTitle")}<input name="title" required /></label>
      <label className="field">{t("askBody")}<textarea name="body" required /></label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit">{common("send")}</button>
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
    <form className="stack" onSubmit={(event) => void onSubmit(event)}>
      <label className="field">{t("answer")}<textarea name="body" required /></label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-small" type="submit">{t("answerAction")}</button>
    </form>
  );
}
