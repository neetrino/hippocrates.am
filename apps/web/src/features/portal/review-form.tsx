"use client";

import { FormEvent, useState } from "react";

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [error, setError] = useState("");

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
      setError("Կարծիքը չպահվեց");
      return;
    }
    window.location.reload();
  }

  return (
    <form className="stack" onSubmit={(event) => void onSubmit(event)}>
      <label className="field">
        Գնահատական
        <select name="rating" defaultValue="5">
          <option value="5">5</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
      </label>
      <label className="field">
        Կարծիք
        <textarea name="body" required />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button className="btn btn-small" type="submit">Ուղարկել կարծիք</button>
    </form>
  );
}
