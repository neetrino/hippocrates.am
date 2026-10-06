"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import { MultiSelectFilter } from "@/features/catalog/multi-select-filter";
import { cn } from "@/shared/ui/cn";

export type DoctorFilterOptions = {
  specialties: string[];
  cities: string[];
  clinics: string[];
  specialtyLabels?: Record<string, string>;
  cityLabels?: Record<string, string>;
  clinicLabels?: Record<string, string>;
};

type DoctorsSearchProps = {
  action: string;
  initialName: string;
  initialSpecialty: string[];
  initialCity: string[];
  initialClinic: string[];
  options: DoctorFilterOptions;
  labels: {
    namePlaceholder: string;
    nameAria: string;
    specialty: string;
    city: string;
    clinic: string;
    openFilters: string;
    resetFilters: string;
    applyFilters: string;
    selectedCount: string;
    all: string;
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
  initialCity,
  initialClinic,
  options,
  labels,
}: DoctorsSearchProps) {
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [city, setCity] = useState(initialCity);
  const [clinic, setClinic] = useState(initialClinic);
  const hasActiveFilter = specialty.length > 0 || city.length > 0 || clinic.length > 0;
  const [filtersOpen, setFiltersOpen] = useState(
    initialSpecialty.length > 0 || initialCity.length > 0 || initialClinic.length > 0,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!filtersOpen) return;
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setFiltersOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [filtersOpen]);

  function resetFilters(): void {
    flushSync(() => {
      setSpecialty([]);
      setCity([]);
      setClinic([]);
    });
    formRef.current?.requestSubmit();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    const form = event.currentTarget;
    for (const element of Array.from(form.elements)) {
      if (!(element instanceof HTMLInputElement)) continue;
      if (!element.name || element.type === "hidden") continue;
      if (element.value.trim()) continue;
      element.disabled = true;
    }
  }

  function selectedCountLabel(count: number): string {
    return labels.selectedCount.replace("{count}", String(count));
  }

  return (
    <form
      ref={formRef}
      action={action}
      method="get"
      onSubmit={onSubmit}
      className="relative grid gap-3"
    >
      <div className="search-shell items-center gap-3 px-4 py-1.5 max-md:flex-row max-md:rounded-full">
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
        className="overflow-visible rounded-card bg-surface p-4 shadow-soft max-md:p-3.5"
      >
        <div className="grid gap-3 overflow-visible md:grid-cols-3 md:items-start">
          <MultiSelectFilter
            label={labels.specialty}
            name="specialty"
            options={options.specialties}
            labelsByValue={options.specialtyLabels}
            selected={specialty}
            onChange={setSpecialty}
            placeholder={labels.specialty}
            allLabel={labels.all}
            selectedCountLabel={selectedCountLabel}
          />
          <MultiSelectFilter
            label={labels.city}
            name="city"
            options={options.cities}
            labelsByValue={options.cityLabels}
            selected={city}
            onChange={setCity}
            placeholder={labels.city}
            allLabel={labels.all}
            selectedCountLabel={selectedCountLabel}
          />
          <MultiSelectFilter
            label={labels.clinic}
            name="clinic"
            options={options.clinics}
            labelsByValue={options.clinicLabels}
            selected={clinic}
            onChange={setClinic}
            placeholder={labels.clinic}
            allLabel={labels.all}
            selectedCountLabel={selectedCountLabel}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="btn btn-secondary min-h-10 px-4 text-[0.82rem]"
          >
            {labels.resetFilters}
          </button>
          <button
            type="submit"
            className="btn btn-primary min-h-10 px-4 text-[0.82rem]"
          >
            {labels.applyFilters}
          </button>
        </div>
      </div>
    </form>
  );
}
