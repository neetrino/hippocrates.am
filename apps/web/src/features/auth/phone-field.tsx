"use client";

import { useEffect, useState } from "react";
import { cn } from "@/shared/ui/cn";

const ARMENIA_DIAL = "374";
const ARMENIA_LENGTH = 8;

type PhoneFieldProps = {
  label: string;
  variant?: "auth" | "form" | "settings";
  phone?: string | null;
  required?: boolean;
};

/** Local digits from a stored Armenian number. An invalid length is kept so it can be corrected. */
export function localArmeniaDigits(phone: string | null): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith(ARMENIA_DIAL) ? digits.slice(ARMENIA_DIAL.length) : digits.replace(/^0/, "");
}

/** `+374` plus exactly 8 digits. Empty or any other length returns null. */
export function armeniaPhone(localDigits: string): string | null {
  const local = localDigits.replace(/\D/g, "").replace(/^0/, "");
  if (local.length !== ARMENIA_LENGTH) return null;
  return `+${ARMENIA_DIAL}${local}`;
}

export function PhoneField({ label, variant = "form", phone = null, required = true }: PhoneFieldProps) {
  const [local, setLocal] = useState(localArmeniaDigits(phone));
  const isAuth = variant === "auth";
  const isSettings = variant === "settings";

  useEffect(() => {
    setLocal(localArmeniaDigits(phone));
  }, [phone]);

  return (
    <div
      className={cn(
        "grid w-full min-w-0 gap-1.5",
        isSettings
          ? "text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase"
          : isAuth
            ? "text-[0.86rem] font-semibold"
            : "text-[0.92rem] font-semibold",
      )}
    >
      <span>{label}</span>
      <div className="grid min-w-0 grid-cols-[minmax(96px,118px)_minmax(0,1fr)] gap-2">
        <span
          className={cn(
            "inline-flex w-full min-w-0 items-center text-[0.92rem] font-normal tracking-normal text-ink normal-case",
            isAuth
              ? "rounded-[14px] border border-[#d7e3e1] bg-white px-3 py-[11px]"
              : "rounded-xl border border-line bg-white px-3.5 py-3",
          )}
          aria-hidden="true"
        >
          +{ARMENIA_DIAL}
        </span>
        <input
          className={cn(
            "w-full min-w-0 text-[0.92rem] font-normal tracking-normal text-ink normal-case placeholder:text-[#9aa6a5] focus:outline-none",
            isAuth
              ? "rounded-[14px] border border-[#d7e3e1] bg-white px-3 py-[11px] focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.18)]"
              : "rounded-xl border border-line bg-white px-3.5 py-3 focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)]",
          )}
          name="phoneLocal"
          type="tel"
          inputMode="numeric"
          placeholder="(XX) XX-XX-XX"
          value={local}
          maxLength={ARMENIA_LENGTH}
          required={required}
          autoComplete="tel-national"
          onChange={(event) => setLocal(limitArmeniaDigits(event.target.value))}
        />
      </div>
    </div>
  );
}

function limitArmeniaDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith(ARMENIA_DIAL) && digits.length > ARMENIA_LENGTH) {
    digits = digits.slice(ARMENIA_DIAL.length);
  }
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, ARMENIA_LENGTH);
}
