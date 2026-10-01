"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

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
    <form className={ui.stack} onSubmit={(event) => void onSubmit(event)}>
      <h2>{t("ask")}</h2>
      <label className={ui.field}>{t("askTitle")}<input name="title" required /></label>
      <label className={ui.field}>{t("askBody")}<textarea name="body" required /></label>
      {error ? <p className={ui.error}>{error}</p> : null}
      <button className={ui.btn} type="submit">{common("send")}</button>
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
    <form className={ui.stack} onSubmit={(event) => void onSubmit(event)}>
      <label className={ui.field}>{t("answer")}<textarea name="body" required /></label>
      {error ? <p className={ui.error}>{error}</p> : null}
      <button className={cx(ui.btn, ui.btnSmall)} type="submit">{t("answerAction")}</button>
    </form>
  );
}
