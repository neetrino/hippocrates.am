"use client";

import { useDeferredValue, useId, useState } from "react";
import { matchesClinic } from "@/features/catalog/match-clinic";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

type PublicClinicsListProps = {
  clinics: ClinicCard[];
  initialQuery: string;
  placeholder: string;
  ariaLabel: string;
  emptyLabel: string;
};

export function PublicClinicsList({
  clinics,
  initialQuery,
  placeholder,
  ariaLabel,
  emptyLabel,
}: PublicClinicsListProps) {
  const [query, setQuery] = useState(initialQuery);
  const deferredQuery = useDeferredValue(query);
  const inputId = useId();
  const filtered = clinics.filter((clinic) => matchesClinic(clinic, deferredQuery));

  return (
    <>
      <label
        htmlFor={inputId}
        className="flex rounded-full border border-line bg-white p-2 shadow-soft focus-within:border-accent/45 focus-within:shadow-[0_14px_36px_rgba(0,167,157,0.12)]"
      >
        <input
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3 outline-none"
        />
      </label>
      {filtered.length === 0 ? <EmptyState>{emptyLabel}</EmptyState> : null}
      <div className="grid gap-4 max-md:gap-3 md:grid-cols-3">
        {filtered.map((clinic, index) => (
          <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
        ))}
      </div>
    </>
  );
}
