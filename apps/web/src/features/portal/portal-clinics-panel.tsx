"use client";

import { useDeferredValue, useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";
import { cn } from "@/shared/ui/cn";

type PortalClinicsPanelProps = {
  clinics: ClinicCard[];
  searchPlaceholder: string;
  searchAriaLabel: string;
  clearLabel: string;
  emptyLabel: string;
  action: ReactNode;
};

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

function matchesClinic(clinic: ClinicCard, query: string): boolean {
  const raw = query.trim();
  if (!raw) return true;

  const tokens = normalizeText(raw).split(/\s+/).filter(Boolean);
  const textHaystack = normalizeText(
    [clinic.name, clinic.district, clinic.address, clinic.phone].join(" "),
  );
  const phoneHaystack = normalizePhone(clinic.phone);

  return tokens.every((token) => {
    const phoneToken = normalizePhone(token);
    if (phoneToken.length >= 2 && phoneHaystack.includes(phoneToken)) return true;
    return textHaystack.includes(token);
  });
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16.2 16.2L20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M7 7l10 10M17 7L7 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function PortalClinicsPanel({
  clinics,
  searchPlaceholder,
  searchAriaLabel,
  clearLabel,
  emptyLabel,
  action,
}: PortalClinicsPanelProps) {
  const t = useTranslations("catalog");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputId = useId();
  const filtered = clinics.filter((clinic) => matchesClinic(clinic, deferredQuery));
  const hasQuery = query.trim().length > 0;
  const isPending = query !== deferredQuery;

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor={inputId}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full border border-line bg-white px-4 shadow-soft transition-[border-color,box-shadow] duration-160 focus-within:border-accent/45 focus-within:shadow-[0_14px_36px_rgba(0,167,157,0.12)] max-md:w-full"
        >
          <span className="shrink-0 text-muted">
            <SearchIcon />
          </span>
          <input
            id={inputId}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Escape" && query) {
                event.preventDefault();
                setQuery("");
              }
            }}
            placeholder={searchPlaceholder}
            aria-label={searchAriaLabel}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 border-0 bg-transparent py-3.5 text-[0.98rem] outline-none placeholder:text-[#9aa6a5]"
          />
          {hasQuery ? (
            <button
              type="button"
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-sand text-muted transition-colors duration-160 hover:bg-accent-soft hover:text-accent"
              aria-label={clearLabel}
              onClick={() => setQuery("")}
            >
              <ClearIcon />
            </button>
          ) : null}
        </label>
        {action}
      </div>

      {hasQuery ? (
        <p
          className={cn(
            "m-0 px-1 text-sm text-muted transition-opacity duration-160",
            isPending ? "opacity-55" : "opacity-100",
          )}
        >
          {t("clinicSearchCount", { count: filtered.length })}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState>{emptyLabel}</EmptyState>
      ) : (
        <div
          className={cn(
            "grid gap-4 transition-opacity duration-160 max-md:gap-3 md:grid-cols-2 xl:grid-cols-3",
            isPending && "opacity-70",
          )}
        >
          {filtered.map((clinic, index) => (
            <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
