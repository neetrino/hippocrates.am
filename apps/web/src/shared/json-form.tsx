"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Field = { name: string; label: string; type?: string };

export function JsonForm(props: { action: string; fields: Field[]; label: string; next: string }) {
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string | number | boolean> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value !== "string") continue;
      payload[key] = /Amd|Minute|weekday|rating|duration/.test(key) ? Number(value) : value;
    }
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
    router.push(props.next);
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={(event) => void onSubmit(event)}>
      {props.fields.map((field) => (
        <label className="field" key={field.name}>
          {field.label}
          <input name={field.name} type={field.type ?? "text"} required />
        </label>
      ))}
      {error ? <p className="error">{error}</p> : null}
      <button className="btn" type="submit">{props.label}</button>
    </form>
  );
}
