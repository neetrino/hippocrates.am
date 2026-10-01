"use client";

import { useState, type ReactNode } from "react";
import type { ClinicCard } from "@/shared/public-types";
import { ClinicTile } from "@/shared/ui/catalog-cards";
import { EmptyState } from "@/shared/ui/empty-state";

type PortalClinicsPanelProps = {
  clinics: ClinicCard[];
  namePlaceholder: string;
  nameAriaLabel: string;
  emptyLabel: string;
  action: ReactNode;
};

function matchesClinic(clinic: ClinicCard, query: string): boolean {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;
  const haystack = [clinic.name, clinic.district, clinic.address].join(" ").toLocaleLowerCase();
  return haystack.includes(needle);
}

export function PortalClinicsPanel({
  clinics,
  namePlaceholder,
  nameAriaLabel,
  emptyLabel,
  action,
}: PortalClinicsPanelProps) {
  const [query, setQuery] = useState("");
  const filtered = clinics.filter((clinic) => matchesClinic(clinic, query));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 rounded-full border border-line bg-white shadow-soft focus-within:border-accent/45 focus-within:shadow-[0_14px_36px_rgba(0,167,157,0.12)] max-md:w-full">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={namePlaceholder}
            aria-label={nameAriaLabel}
            autoComplete="off"
            className="w-full min-w-0 border-0 bg-transparent px-5 py-3.5 outline-none"
          />
        </div>
        {action}
      </div>
      {filtered.length === 0 ? <EmptyState>{emptyLabel}</EmptyState> : null}
      <div className="grid gap-4 max-md:gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((clinic, index) => (
          <ClinicTile key={clinic.id} clinic={clinic} loading={index === 0 ? "eager" : undefined} />
        ))}
      </div>
    </div>
  );
}
