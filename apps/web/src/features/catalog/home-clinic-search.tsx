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
      <form
        className="flex gap-2 rounded-full border border-line bg-white p-2 shadow-soft focus-within:border-accent/45 focus-within:shadow-[0_14px_36px_rgba(0,167,157,0.12)] max-md:flex-col max-md:rounded-[18px]"
        action={action}
        role="search"
      >
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
          className="flex-1 border-0 bg-transparent px-4 py-3 outline-none"
        />
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent max-md:w-full"
          type="submit"
        >
          {searchLabel}
        </button>
      </form>
      {show ? <SuggestionList id={listId} clinics={suggestions} emptyLabel={emptyLabel} /> : null}
    </div>
  );
}

function SuggestionList({ id, clinics, emptyLabel }: { id: string; clinics: ClinicCard[]; emptyLabel: string }) {
  return (
    <ul
      id={id}
      role="listbox"
      className="absolute top-full right-0 left-0 z-20 mt-2 overflow-hidden rounded-[1.2rem] border border-line bg-white shadow-soft"
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
