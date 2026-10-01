"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "@/shared/ui/cn";

type DoctorsSearchProps = {
  action: string;
  initialName: string;
  initialSpecialty: string;
  labels: {
    namePlaceholder: string;
    nameAria: string;
    specialty: string;
    openFilters: string;
    resetFilters: string;
    applyFilters: string;
  };
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px] shrink-0 text-muted">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16.2 16.2L20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        d="M4.5 5.5h15l-5.8 7.2v4.8l-3.4 1.7v-6.5L4.5 5.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoctorsSearch({
  action,
  initialName,
  initialSpecialty,
  labels,
}: DoctorsSearchProps) {
  const [filtersOpen, setFiltersOpen] = useState(Boolean(initialSpecialty));
  const formRef = useRef<HTMLFormElement>(null);
  const specialtyRef = useRef<HTMLInputElement>(null);
  const panelId = useId();
  const hasActiveFilter = Boolean(initialSpecialty);

  useEffect(() => {
    if (!filtersOpen) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [filtersOpen]);

  function resetFilters(): void {
    if (specialtyRef.current) specialtyRef.current.value = "";
    formRef.current?.requestSubmit();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    const form = event.currentTarget;
    for (const element of Array.from(form.elements)) {
      if (!(element instanceof HTMLInputElement)) continue;
      if (!element.name || element.value.trim()) continue;
      element.disabled = true;
    }
  }

  return (
    <form
      ref={formRef}
      action={action}
      method="get"
      onSubmit={onSubmit}
      className="relative grid gap-3"
    >
      <div className="flex items-center gap-3 rounded-full bg-[#eef2f2] px-4 py-[13px] shadow-[0_8px_22px_rgba(20,36,40,0.06)] transition-[box-shadow,background] duration-160 focus-within:bg-[#e8eded] focus-within:shadow-[0_10px_26px_rgba(0,167,157,0.12)]">
        <SearchIcon />
        <input
          name="name"
          defaultValue={initialName}
          placeholder={labels.namePlaceholder}
          aria-label={labels.nameAria}
          className="min-w-0 flex-1 border-0 bg-transparent text-[0.95rem] text-ink outline-none placeholder:text-[#9aa6a5]"
        />
        <button
          type="button"
          className={cn(
            "grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted transition-[background,color,box-shadow] duration-160 hover:bg-white hover:text-accent hover:shadow-[0_4px_12px_rgba(0,167,157,0.12)]",
            (filtersOpen || hasActiveFilter) && "bg-white text-accent shadow-[0_4px_12px_rgba(0,167,157,0.12)]",
          )}
          aria-label={labels.openFilters}
          aria-expanded={filtersOpen}
          aria-controls={panelId}
          onClick={() => setFiltersOpen((value) => !value)}
        >
          <FilterIcon />
        </button>
      </div>

      <div
        id={panelId}
        hidden={!filtersOpen}
        className="rounded-[18px] border border-line bg-white p-4 shadow-soft max-md:p-3.5"
      >
        <label className="grid gap-1.5 text-[0.86rem] font-semibold text-ink">
          <span>{labels.specialty}</span>
          <input
            ref={specialtyRef}
            name="specialty"
            defaultValue={initialSpecialty}
            placeholder={labels.specialty}
            aria-label={labels.specialty}
            className="rounded-xl border border-line bg-white px-3.5 py-3 text-[0.95rem] font-normal text-ink outline-none placeholder:text-[#9aa6a5] focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)]"
          />
        </label>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-line bg-white px-4 py-2 text-[0.78rem] font-semibold tracking-[0.06em] text-ink uppercase transition-colors duration-160 hover:border-accent/35 hover:text-accent"
          >
            {labels.resetFilters}
          </button>
          <button
            type="submit"
            className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-4 py-2 text-[0.78rem] font-semibold tracking-[0.06em] text-white uppercase transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent"
          >
            {labels.applyFilters}
          </button>
        </div>
      </div>
    </form>
  );
}
