"use client";

import { cn } from "@/shared/ui/cn";

const ARMENIA_DIAL_CODE = "374";

type PhoneFieldProps = {
  label: string;
  variant?: "auth" | "form";
};

export function PhoneField({ label, variant = "form" }: PhoneFieldProps) {
  const isAuth = variant === "auth";
  return (
    <div
      className={cn(
        "grid w-full min-w-0 gap-1.5 font-semibold",
        isAuth ? "text-[0.86rem]" : "text-[0.92rem]",
      )}
    >
      <span>{label}</span>
      <div className="grid min-w-0 grid-cols-[minmax(96px,118px)_minmax(0,1fr)] gap-2">
        <span
          className={cn(
            "inline-flex w-full min-w-0 items-center whitespace-nowrap text-[0.92rem] font-normal text-ink",
            isAuth
              ? "rounded-[14px] border border-[#d7e3e1] bg-white px-3 py-[11px]"
              : "rounded-xl border border-line bg-white px-3.5 py-3",
          )}
          aria-hidden="true"
        >
          +{ARMENIA_DIAL_CODE}
        </span>
        <input
          className={cn(
            "w-full min-w-0 text-[0.92rem] font-normal text-ink placeholder:text-[#9aa6a5] focus:outline-none",
            isAuth
              ? "rounded-[14px] border border-[#d7e3e1] bg-white px-3 py-[11px] focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.18)]"
              : "rounded-xl border border-line bg-white px-3.5 py-3 focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)]",
          )}
          name="phoneLocal"
          type="tel"
          inputMode="numeric"
          placeholder="(XX) XX-XX-XX"
          required
          autoComplete="tel-national"
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
          }}
        />
      </div>
    </div>
  );
}

export function buildPhoneNumber(localDigits: string): string {
  return `+${ARMENIA_DIAL_CODE}${localDigits.replace(/\D/g, "")}`;
}
