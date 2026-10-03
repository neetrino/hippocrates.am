"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { countryName } from "@/features/auth/phone-country-names";
import { cn } from "@/shared/ui/cn";
import {
  countryByIso,
  normalizeLocalDigits,
  phoneMaxLength,
  phonePlaceholder,
  PHONE_COUNTRIES,
  splitPhone,
  type PhoneCountry,
} from "@/features/auth/phone-countries";

type PhoneVariant = "auth" | "form" | "settings";

type PhoneFieldProps = {
  label: string;
  variant?: PhoneVariant;
  phone?: string | null;
  required?: boolean;
};

export function PhoneField({ label, variant = "form", phone = null, required = true }: PhoneFieldProps) {
  const initial = splitPhone(phone);
  const [iso, setIso] = useState(initial.iso);
  const [local, setLocal] = useState(initial.local);
  const country = countryByIso(iso);

  useEffect(() => {
    const next = splitPhone(phone);
    setIso(next.iso);
    setLocal(next.local);
  }, [phone]);

  function onCountry(nextIso: string): void {
    const nextCountry = countryByIso(nextIso);
    setIso(nextIso);
    setLocal((current) => normalizeLocalDigits(nextCountry, current));
  }

  return (
    <div className={fieldClass(variant)}>
      <span>{label}</span>
      <div className="grid min-w-0 grid-cols-[minmax(8.75rem,11.5rem)_minmax(0,1fr)] gap-2">
        <CountrySelect iso={iso} variant={variant} onCountry={onCountry} />
        <LocalNumber
          country={country}
          local={local}
          required={required}
          variant={variant}
          onLocal={setLocal}
        />
      </div>
    </div>
  );
}

function CountrySelect({
  iso,
  variant,
  onCountry,
}: {
  iso: string;
  variant: PhoneVariant;
  onCountry: (iso: string) => void;
}) {
  const locale = useLocale();
  const t = useTranslations("auth");
  return (
    <select
      name="phoneCountry"
      aria-label={t("country")}
      value={iso}
      className={controlClass(variant)}
      onChange={(event) => onCountry(event.target.value)}
    >
      {orderedCountries(locale).map((country) => (
        <option key={country.iso} value={country.iso}>
          {`+${country.dial} ${countryName(country.iso, locale)}`}
        </option>
      ))}
    </select>
  );
}

function LocalNumber({
  country,
  local,
  required,
  variant,
  onLocal,
}: {
  country: PhoneCountry;
  local: string;
  required: boolean;
  variant: PhoneVariant;
  onLocal: (value: string) => void;
}) {
  const max = phoneMaxLength(country);
  return (
    <input
      className={controlClass(variant)}
      name="phoneLocal"
      type="tel"
      inputMode="numeric"
      placeholder={phonePlaceholder(country)}
      value={local}
      maxLength={max}
      required={required}
      autoComplete="tel-national"
      onChange={(event) => onLocal(normalizeLocalDigits(country, event.target.value))}
    />
  );
}

function orderedCountries(locale: string): PhoneCountry[] {
  const home = PHONE_COUNTRIES.find((country) => country.iso === "AM");
  const rest = PHONE_COUNTRIES.filter((country) => country.iso !== "AM").sort((left, right) => {
    return countryName(left.iso, locale).localeCompare(countryName(right.iso, locale), locale);
  });
  return home ? [home, ...rest] : rest;
}

function fieldClass(variant: PhoneVariant): string {
  return cn(
    "grid w-full min-w-0 gap-1.5",
    variant === "settings"
      ? "text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase"
      : variant === "auth"
        ? "text-[0.86rem] font-semibold"
        : "text-[0.92rem] font-semibold",
  );
}

function controlClass(variant: PhoneVariant): string {
  const shared = "w-full min-w-0 text-[0.92rem] font-normal tracking-normal text-ink normal-case focus:outline-none";
  if (variant === "auth") {
    return cn(
      shared,
      "rounded-[14px] border border-[#d7e3e1] bg-white px-3 py-[11px] focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.18)]",
    );
  }
  return cn(
    shared,
    "rounded-xl border border-line bg-white px-3.5 py-3 focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)]",
  );
}
