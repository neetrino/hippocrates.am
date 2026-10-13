"use client";

import { type FormEvent } from "react";
import { ClinicSearchField } from "@/features/catalog/clinic-search-field";
import type { ClinicCard } from "@/shared/public-types";

type ClinicsSearchProps = {
  action: string;
  suggestClinics: ClinicCard[];
  initialName: string;
  placeholder: string;
  ariaLabel: string;
  searchLabel: string;
  emptySuggest: string;
};

export function ClinicsSearch({
  action,
  suggestClinics,
  initialName,
  placeholder,
  ariaLabel,
  searchLabel,
  emptySuggest,
}: ClinicsSearchProps) {
  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    const form = event.currentTarget;
    for (const element of Array.from(form.elements)) {
      if (!(element instanceof HTMLInputElement)) continue;
      if (!element.name || element.type === "hidden") continue;
      if (element.value.trim()) continue;
      element.disabled = true;
    }
  }

  return (
    <form action={action} method="get" onSubmit={onSubmit} className="relative">
      <div className="search-shell" role="search">
        <ClinicSearchField
          clinics={suggestClinics}
          initialName={initialName}
          placeholder={placeholder}
          ariaLabel={ariaLabel}
          emptyLabel={emptySuggest}
        />
        <button className="btn btn-primary shrink-0 gap-1.5" type="submit">
          <SubmitSearchIcon />
          {searchLabel}
        </button>
      </div>
    </form>
  );
}

function SubmitSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 16.2 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
