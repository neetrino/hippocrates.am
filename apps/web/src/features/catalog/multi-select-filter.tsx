"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/shared/ui/cn";

type MultiSelectFilterProps = {
  label: string;
  name: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  allLabel: string;
  selectedCountLabel: (count: number) => string;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-160", open && "rotate-180")}
    >
      <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OptionRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={checked}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 px-3 py-2.5 text-left text-[0.92rem] font-normal transition-colors duration-140",
        checked ? "bg-accent-soft text-accent" : "bg-transparent text-ink hover:bg-sand",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] border transition-colors duration-140",
          checked ? "border-accent bg-accent text-white" : "border-line bg-white",
        )}
        aria-hidden="true"
      >
        {checked ? (
          <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
            <path
              d="M2.5 6.2L4.8 8.5L9.5 3.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </span>
      <span className="min-w-0 truncate">{label}</span>
    </button>
  );
}

export function MultiSelectFilter({
  label,
  name,
  options,
  selected,
  onChange,
  placeholder,
  allLabel,
  selectedCountLabel,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selectedSet = new Set(selected);
  const allSelected = selected.length === 0;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function selectAll(): void {
    onChange([]);
  }

  function toggle(option: string): void {
    if (selectedSet.has(option)) {
      onChange(selected.filter((item) => item !== option));
      return;
    }
    onChange([...selected, option]);
  }

  const summary = allSelected
    ? allLabel
    : selected.length === 1
      ? selected[0]
      : selectedCountLabel(selected.length);

  return (
    <div
      className={cn("relative grid gap-1.5 text-[0.86rem] font-semibold text-ink", open && "z-30")}
      ref={rootRef}
    >
      <span>{label}</span>
      {selected.map((value) => (
        <input key={`${name}-${value}`} type="hidden" name={name} value={value} />
      ))}
      <button
        type="button"
        className={cn(
          "flex min-h-[48px] w-full cursor-pointer items-center justify-between gap-2 rounded-xl border border-line bg-white px-3.5 py-3 text-left text-[0.95rem] font-normal text-ink outline-none transition-[border-color,box-shadow] duration-160",
          open
            ? "border-accent shadow-[0_0_0_3px_rgba(0,167,157,0.16)]"
            : "hover:border-accent/40",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="min-w-0 truncate">{summary || placeholder}</span>
        <ChevronIcon open={open} />
      </button>
      {open ? (
        <div
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          aria-label={label}
          className="absolute top-[calc(100%+6px)] right-0 left-0 z-40 grid max-h-56 gap-0.5 overflow-y-auto rounded-[14px] border border-line bg-white p-1.5 shadow-[0_16px_36px_rgba(20,36,40,0.14)]"
        >
          <OptionRow label={allLabel} checked={allSelected} onClick={selectAll} />
          {options.map((option) => (
            <OptionRow
              key={option}
              label={option}
              checked={selectedSet.has(option)}
              onClick={() => toggle(option)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
