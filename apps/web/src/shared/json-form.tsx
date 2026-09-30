"use client";

import { FormEvent, useState } from "react";

type Field = { name: string; label: string; type?: string };

export function JsonForm(props: { action: string; fields: Field[]; label: string; next: string }) {
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string | number | boolean> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value !== "string") continue;
      payload[key] = /Amd|Minute|weekday|rating|duration/.test(key) ? Number(value) : value;
    }
    if (form.get("isEstimate") === "on") payload.isEstimate = true;
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${props.action}`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      setError("Գործողությունը չհաջողվեց");
      return;
    }
    window.location.href = props.next;
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)}>
      {props.fields.map((field) => (
        <label key={field.name}>
          {field.label}
          <input name={field.name} type={field.type ?? "text"} required />
        </label>
      ))}
      {error ? <p>{error}</p> : null}
      <button type="submit">{props.label}</button>
    </form>
  );
}
