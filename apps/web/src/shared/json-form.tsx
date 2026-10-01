"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

type Field = { name: string; label: string; type?: string; placeholder?: string };

export function JsonForm(props: { action: string; fields: Field[]; label: string; next: string }) {
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("common");

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
      setError(t("failed"));
      return;
    }
    router.push(props.next);
    router.refresh();
  }

  return (
    <form className={ui.stack} onSubmit={(event) => void onSubmit(event)}>
      {props.fields.map((field) => (
        <label className={ui.field} key={field.name}>
          {field.label}
          <input
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            required
          />
        </label>
      ))}
      {error ? <p className={ui.error}>{error}</p> : null}
      <button className={cx(ui.btn, ui.btnBlock)} type="submit">{props.label}</button>
    </form>
  );
}
