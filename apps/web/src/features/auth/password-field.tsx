"use client";

import { useState } from "react";

type PasswordFieldProps = {
  name: string;
  label: string;
  placeholder: string;
  autoComplete: string;
  showLabel: string;
  hideLabel: string;
  variant?: "auth" | "portal";
};

export function PasswordField({
  name,
  label,
  placeholder,
  autoComplete,
  showLabel,
  hideLabel,
  variant = "auth",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const portal = variant === "portal";
  return (
    <label
      className={
        portal
          ? "grid w-full min-w-0 gap-1.5 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase"
          : "field-label"
      }
    >
      {label}
      <span
        className={
          portal
            ? "flex w-full min-w-0 items-center overflow-hidden rounded-xl border border-line bg-white pr-1 focus-within:border-accent focus-within:shadow-[0_0_0_3px_rgba(0,167,157,0.16)]"
            : "flex w-full max-w-full min-w-0 items-center gap-0.5 overflow-hidden rounded-[0.9rem] border-0 bg-auth-field pr-1 focus-within:bg-auth-field-focus focus-within:shadow-[0_0_0_3px_rgba(0,167,157,0.18)]"
        }
      >
        <input
          name={name}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          className={`min-w-0 w-full flex-1 border-0 bg-transparent pr-1 font-normal normal-case shadow-none placeholder:text-[#9aa6a5] focus:outline-none ${portal ? "px-3.5 py-3 text-base tracking-normal text-ink" : "px-3 py-[11px] text-[0.92rem]"}`}
        />
        <button
          type="button"
          className="grid h-[30px] w-[30px] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted hover:bg-white/70 hover:text-accent"
          aria-label={visible ? hideLabel : showLabel}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </span>
    </label>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12s-3.5 6.5-9.5 6.5S2.5 12 2.5 12z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="M3 3l18 18M9.5 9.7A3 3 0 0012 15a3 3 0 002.9-2.3M6.2 6.5C4.2 7.8 2.8 9.7 2.5 12c0 0 3.5 6.5 9.5 6.5 2 0 3.7-.5 5.1-1.3M10.2 5.7C10.8 5.6 11.4 5.5 12 5.5c6 0 9.5 6.5 9.5 6.5-.3.7-.8 1.6-1.5 2.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
