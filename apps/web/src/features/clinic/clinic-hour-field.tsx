"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const HOUR_STEP_MINUTES = 30;
const FIRST_SLOT_MINUTE = 6 * 60;
const LAST_SLOT_MINUTE = 22 * 60;
const TIME_FIELD_CLASS = "field-control w-[8.75rem] shrink-0 py-2 pr-8";

export function TimeSelect({
  value,
  closedLabel,
  name,
  listLabel,
  placeholder,
  minMinute,
  maxMinute,
  onChange,
}: {
  value: string;
  closedLabel: string;
  name: string;
  listLabel: string;
  placeholder: string;
  minMinute?: number;
  maxMinute?: number;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const shown = draft ?? value;
  const choices = timesFor(value, minMinute, maxMinute);

  useMenuDismiss(root, open, setOpen);

  function apply(raw: string): void {
    const next = parseHourInput(raw);
    if (next === null || (next !== "" && !minuteAllowed(next, minMinute, maxMinute))) {
      onChange(value);
    } else {
      onChange(next);
    }
    setDraft(null);
  }

  return (
    <div className="relative" ref={root}>
      <TimeField name={name} draft={shown} placeholder={placeholder} onDraft={setDraft} onApply={apply} onOpenList={() => setOpen(true)} />
      <TimeToggle open={open} label={listLabel} onToggle={() => setOpen((current) => !current)} />
      {open ? (
        <TimeMenu
          value={value}
          closedLabel={closedLabel}
          choices={choices}
          onPick={(time) => {
            apply(time);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function useMenuDismiss(root: RefObject<HTMLDivElement | null>, open: boolean, setOpen: (open: boolean) => void): void {
  useEffect(() => {
    if (!open) return;
    function onMouse(event: MouseEvent): void {
      if (root.current?.contains(event.target as Node)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onMouse);
    return () => document.removeEventListener("mousedown", onMouse);
  }, [open, root, setOpen]);
}

function TimeToggle({ open, label, onToggle }: { open: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      type="button"
      className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-1 text-muted"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-label={label}
      onClick={onToggle}
    >
      ▾
    </button>
  );
}

function TimeField({
  name,
  draft,
  placeholder,
  onDraft,
  onApply,
  onOpenList,
}: {
  name: string;
  draft: string;
  placeholder: string;
  onDraft: (value: string) => void;
  onApply: (value: string) => void;
  onOpenList: () => void;
}) {
  return (
    <input
      className={TIME_FIELD_CLASS}
      value={draft}
      placeholder={placeholder}
      inputMode="numeric"
      autoComplete="off"
      aria-label={name}
      onChange={(event) => onDraft(event.target.value)}
      onBlur={(event) => {
        if (event.relatedTarget instanceof Node && event.currentTarget.parentElement?.contains(event.relatedTarget)) return;
        onApply(draft);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onApply(draft);
        }
        if (event.key === "ArrowDown") {
          event.preventDefault();
          onOpenList();
        }
      }}
    />
  );
}

function TimeMenu({
  value,
  closedLabel,
  choices,
  onPick,
}: {
  value: string;
  closedLabel: string;
  choices: string[];
  onPick: (time: string) => void;
}) {
  return (
    <ul className="absolute top-full z-20 mt-1 max-h-36 w-full overflow-y-auto rounded-xl border border-line bg-white p-1 shadow-soft">
      <li>
        <TimeOption active={!value} label={closedLabel} onPick={() => onPick("")} />
      </li>
      {choices.map((time) => (
        <li key={time}>
          <TimeOption active={value === time} label={time} onPick={() => onPick(time)} />
        </li>
      ))}
    </ul>
  );
}

function TimeOption({ active, label, onPick }: { active: boolean; label: string; onPick: () => void }) {
  return (
    <button
      type="button"
      className={`flex w-full cursor-pointer rounded-lg px-2 py-1 text-left text-sm ${active ? "bg-accent-soft font-semibold" : "hover:bg-sand"}`}
      onClick={onPick}
    >
      {label}
    </button>
  );
}

function parseHourInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const match = /^(\d{1,2})(?:[:.](\d{2}))?$/.exec(trimmed) ?? /^(\d{2})(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "00");
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function timesFor(current: string, minMinute?: number, maxMinute?: number): string[] {
  const choices = HOUR_CHOICES.filter((time) => minuteAllowed(time, minMinute, maxMinute));
  if (current && !choices.includes(current) && minuteAllowed(current, minMinute, maxMinute)) {
    return [...choices, current].sort();
  }
  return choices;
}

function minuteAllowed(time: string, minMinute?: number, maxMinute?: number): boolean {
  const minutes = timeToMinutes(time);
  if (minutes === null) return false;
  if (minMinute !== undefined && minutes < minMinute) return false;
  if (maxMinute !== undefined && minutes > maxMinute) return false;
  return true;
}

function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function slotLabel(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

const HOUR_CHOICES: string[] = [];
for (let minute = FIRST_SLOT_MINUTE; minute <= LAST_SLOT_MINUTE; minute += HOUR_STEP_MINUTES) {
  HOUR_CHOICES.push(slotLabel(minute));
}
