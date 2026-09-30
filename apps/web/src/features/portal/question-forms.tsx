"use client";

import { FormEvent, useState } from "react";

export function AskQuestionForm() {
  const [error, setError] = useState("");

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
      setError("Հարցը չուղարկվեց");
      return;
    }
    window.location.reload();
  }

  return (
    <form className="stack" onSubmit={(event) => void onSubmit(event)}>
      <h2>Հարց ուղարկել</h2>
      <label className="field">Վերնագիր<input name="title" required /></label>
      <label className="field">Հարց<textarea name="body" required /></label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit">Ուղարկել</button>
    </form>
  );
}

export function AnswerForm({ questionId }: { questionId: string }) {
  const [error, setError] = useState("");

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
      setError("Պատասխանը չպահվեց");
      return;
    }
    window.location.reload();
  }

  return (
    <form className="stack" onSubmit={(event) => void onSubmit(event)}>
      <label className="field">Պատասխան<textarea name="body" required /></label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-small" type="submit">Պատասխանել</button>
    </form>
  );
}
