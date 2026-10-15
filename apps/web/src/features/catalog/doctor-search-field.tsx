"use client";

import { useId, useState } from "react";
import { matchesDoctor } from "@/features/catalog/match-doctor";
import { Link } from "@/i18n/navigation";
import type { DoctorCard } from "@/shared/public-types";

const suggestionLimit = 6;

type DoctorSearchFieldProps = {
  doctors: DoctorCard[];
  initialName: string;
  placeholder: string;
  ariaLabel: string;
  emptyLabel: string;
};

export function DoctorSearchField({
  doctors,
  initialName,
  placeholder,
  ariaLabel,
  emptyLabel,
}: DoctorSearchFieldProps) {
  const [query, setQuery] = useState(initialName);
  const [open, setOpen] = useState(false);
  const listId = useId();
  const suggestions = suggestDoctors(doctors, query);
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
      {show ? <DoctorSuggestionList id={listId} doctors={suggestions} emptyLabel={emptyLabel} /> : null}
    </div>
  );
}

function DoctorSuggestionList({
  id,
  doctors,
  emptyLabel,
}: {
  id: string;
  doctors: DoctorCard[];
  emptyLabel: string;
}) {
  return (
    <ul
      id={id}
      role="listbox"
      onMouseDown={(event) => event.preventDefault()}
      className="absolute right-0 left-0 z-20 overflow-hidden rounded-card border border-line bg-surface shadow-soft max-md:bottom-[calc(100%+0.5rem)] md:top-[calc(100%+0.5rem)]"
    >
      {doctors.length === 0 ? <li className="px-4 py-3 text-muted">{emptyLabel}</li> : null}
      {doctors.map((doctor) => (
        <li key={doctor.id} role="option">
          <Link
            href={`/doctors/${doctor.id}`}
            className="grid gap-0.5 px-4 py-3 transition-colors duration-160 hover:bg-sand"
          >
            <span className="font-semibold text-ink">{doctor.user.displayName}</span>
            <span className="text-sm text-muted">
              {[doctor.specialty, doctor.clinic.name].filter(Boolean).join(" · ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function suggestDoctors(doctors: DoctorCard[], query: string): DoctorCard[] {
  const raw = query.trim();
  if (!raw) return [];
  return doctors.filter((doctor) => matchesDoctor(doctor, raw)).slice(0, suggestionLimit);
}

function closeUnlessInside(
  event: { currentTarget: Node; relatedTarget: EventTarget | null },
  close: () => void,
): void {
  if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
  close();
}
