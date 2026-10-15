"use client";

import { useId, useState } from "react";
import { matchesClinicName } from "@/features/catalog/match-clinic-name";
import { Link } from "@/i18n/navigation";
import type { ClinicCard } from "@/shared/public-types";

const suggestionLimit = 6;

type ClinicSearchFieldProps = {
  clinics: ClinicCard[];
  initialName: string;
  placeholder: string;
  ariaLabel: string;
  emptyLabel: string;
};

export function ClinicSearchField({
  clinics,
  initialName,
  placeholder,
  ariaLabel,
  emptyLabel,
}: ClinicSearchFieldProps) {
  const [query, setQuery] = useState(initialName);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const suggestions = suggestClinics(clinics, query);
  const show = open && query.trim().length > 0;

  return (
    <div className="relative min-w-0 flex-1" onBlur={(event) => closeUnlessInside(event, () => setOpen(false))}>
      <input
        name="name"
        role="combobox"
        value={query}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={show}
        autoComplete="off"
        spellCheck={false}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full min-w-0 border-0 bg-transparent px-4 py-2.5 text-base outline-none placeholder:text-text-muted"
      />
      {show ? <ClinicSuggestionList id={listId} clinics={suggestions} emptyLabel={emptyLabel} /> : null}
    </div>
  );
}

function ClinicSuggestionList({
  id,
  clinics,
  emptyLabel,
}: {
  id: string;
  clinics: ClinicCard[];
  emptyLabel: string;
}) {
  return (
    <ul
      id={id}
      role="listbox"
      onMouseDown={(event) => event.preventDefault()}
      className="absolute right-0 left-0 z-20 overflow-hidden rounded-card border border-line bg-surface shadow-soft max-md:bottom-[calc(100%+0.5rem)] md:top-[calc(100%+0.5rem)]"
    >
      {clinics.length === 0 ? <li className="px-4 py-3 text-muted">{emptyLabel}</li> : null}
      {clinics.map((clinic) => (
        <li key={clinic.id} role="option" aria-selected={false}>
          <Link
            href={`/clinics/${clinic.id}`}
            className="grid gap-0.5 px-4 py-3 transition-colors duration-160 hover:bg-sand"
          >
            <span className="font-semibold text-ink">{clinic.name}</span>
            <span className="text-sm text-muted">{[clinic.district, clinic.address].filter(Boolean).join(" · ")}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function suggestClinics(clinics: ClinicCard[], query: string): ClinicCard[] {
  const raw = query.trim();
  if (!raw) return [];
  return clinics.filter((clinic) => matchesClinicName(clinic, raw)).slice(0, suggestionLimit);
}

function closeUnlessInside(
  event: { currentTarget: Node; relatedTarget: EventTarget | null },
  close: () => void,
): void {
  if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
  close();
}
