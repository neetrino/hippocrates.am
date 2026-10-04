"use client";

import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";
import { armeniaPhone, PhoneField } from "@/features/auth/phone-field";
import { useRouter } from "@/i18n/navigation";
import { isNameFieldName, isPhoneFieldName, sanitizeNameInput } from "@/shared/input-constraints";

type Field = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  kind?: "text" | "phone" | "name";
};

function fieldKind(field: Field): "text" | "phone" | "name" {
  if (field.kind) return field.kind;
  if (isPhoneFieldName(field.name)) return "phone";
  if (isNameFieldName(field.name)) return "name";
  return "text";
}

export function JsonForm(props: { action: string; fields: Field[]; label: string; next: string }) {
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("common");
  const auth = useTranslations("auth");
  const usesPhoneField = props.fields.some((field) => fieldKind(field) === "phone");

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, string | number | boolean> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value !== "string") continue;
      if (key === "phoneLocal") continue;
      payload[key] = /Amd|Minute|weekday|rating|duration/.test(key) ? Number(value) : value;
    }
    if (usesPhoneField) {
      const phone = armeniaPhone(String(form.get("phoneLocal") ?? ""));
      if (!phone) {
        setError(auth("phoneInvalid"));
        return;
      }
      payload.phone = phone;
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
    <form className="grid gap-3.5" onSubmit={(event) => void onSubmit(event)}>
      {props.fields.map((field) => {
        const kind = fieldKind(field);
        if (kind === "phone") {
          return <PhoneField key={field.name} label={field.label} />;
        }
        return (
          <label className="grid gap-1.5 text-[0.92rem] font-semibold" key={field.name}>
            {field.label}
            <input
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              required
              className="rounded-xl border border-line bg-white px-3.5 py-3 font-normal placeholder:text-[#9aa6a5] focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none"
              onInput={
                kind === "name"
                  ? (event) => {
                      event.currentTarget.value = sanitizeNameInput(event.currentTarget.value);
                    }
                  : undefined
              }
            />
          </label>
        );
      })}
      {error ? <p className="m-0 text-danger">{error}</p> : null}
      <button
        className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent disabled:cursor-not-allowed disabled:opacity-55"
        type="submit"
      >
        {props.label}
      </button>
    </form>
  );
}
