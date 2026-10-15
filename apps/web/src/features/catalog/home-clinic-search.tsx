"use client";

import { useId, useState } from "react";
import { matchesClinic } from "@/features/catalog/match-clinic";
import { Link } from "@/i18n/navigation";
import type { ClinicCard } from "@/shared/public-types";

const suggestionLimit = 6;

type HomeClinicSearchProps = {
  clinics: ClinicCard[];
  action: string;
  placeholder: string;
  searchLabel: string;
  emptyLabel: string;
};

export function HomeClinicSearch({ clinics, action, placeholder, searchLabel, emptyLabel }: HomeClinicSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const listId = useId();
  const suggestions = suggest(clinics, query);
  const show = open && query.trim().length > 0;

  return (
    <div className="relative" onBlur={(event) => closeUnlessInside(event, () => setOpen(false))}>
      <form className="search-shell" action={action} role="search">
        <input
          name="name"
          role="combobox"
          value={query}
          placeholder={placeholder}
          aria-label={placeholder}
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
          className="min-w-0 flex-1 border-0 bg-transparent px-4 py-2.5 text-base outline-none placeholder:text-text-muted"
        />
        <button className="btn btn-primary shrink-0 gap-1.5" type="submit">
          <SearchIcon />
          {searchLabel}
        </button>
      </form>
      {show ? <SuggestionList id={listId} clinics={suggestions} emptyLabel={emptyLabel} /> : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-4 shrink-0">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 16.2 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SuggestionList({ id, clinics, emptyLabel }: { id: string; clinics: ClinicCard[]; emptyLabel: string }) {
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
          <Link href={`/clinics/${clinic.id}`} className="grid gap-0.5 px-4 py-3 transition-colors duration-160 hover:bg-sand">
            <span className="font-semibold text-ink">{clinic.name}</span>
            <span className="text-sm text-muted">{[clinic.district, clinic.address].filter(Boolean).join(" · ")}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function suggest(clinics: ClinicCard[], query: string): ClinicCard[] {
  const raw = query.trim();
  if (!raw) return [];
  return clinics.filter((clinic) => matchesClinic(clinic, raw)).slice(0, suggestionLimit);
}

function closeUnlessInside(event: { currentTarget: Node; relatedTarget: EventTarget | null }, close: () => void): void {
  if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
  close();
}
