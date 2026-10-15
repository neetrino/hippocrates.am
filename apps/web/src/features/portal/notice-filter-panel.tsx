"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { NoticeFilters, NoticeKindFilter, NoticeWhen } from "@/features/portal/notice-filters";
import type { NoticeKind } from "@/shared/notice-text";

const whenValues: NoticeWhen[] = ["all", "today", "week", "month"];
const kindValues: NoticeKindFilter[] = ["all", "request", "confirmed", "cancelled", "rescheduled", "other"];

export function NoticeFilterPanel({
  id,
  open,
  filters,
  people,
  onChange,
  onReset,
}: {
  id: string;
  open: boolean;
  filters: NoticeFilters;
  people: string[];
  onChange: (filters: NoticeFilters) => void;
  onReset: () => void;
}) {
  const labels = useFilterLabels();
  return (
    <div id={id} hidden={!open} className="overflow-visible rounded-card bg-surface p-4 shadow-soft max-md:p-3.5">
      <div className="grid gap-3">
        <PillRow
          label={labels.when}
          values={whenValues}
          active={filters.when}
          names={labels.whenOf}
          onPick={(when) => onChange({ ...filters, when })}
        />
        <PillRow
          label={labels.kind}
          values={kindValues}
          active={filters.kind}
          names={labels.kindOf}
          onPick={(kind) => onChange({ ...filters, kind })}
        />
        <PersonRow filters={filters} people={people} labels={labels} onChange={onChange} />
        <FilterRow label={labels.status}>
          <FilterPill active={!filters.unread} label={labels.all} onClick={() => onChange({ ...filters, unread: false })} />
          <FilterPill active={filters.unread} label={labels.unread} onClick={() => onChange({ ...filters, unread: true })} />
        </FilterRow>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="button" className="btn btn-secondary min-h-10 px-4 text-[0.82rem]" onClick={onReset}>
          {labels.reset}
        </button>
      </div>
    </div>
  );
}

function PillRow<T extends string>({
  label,
  values,
  active,
  names,
  onPick,
}: {
  label: string;
  values: T[];
  active: T;
  names: Record<T, string>;
  onPick: (value: T) => void;
}) {
  return (
    <FilterRow label={label}>
      {values.map((value) => (
        <FilterPill key={value} active={active === value} label={names[value]} onClick={() => onPick(value)} />
      ))}
    </FilterRow>
  );
}

function PersonRow({
  filters,
  people,
  labels,
  onChange,
}: {
  filters: NoticeFilters;
  people: string[];
  labels: FilterLabels;
  onChange: (filters: NoticeFilters) => void;
}) {
  return (
    <FilterRow label={labels.person}>
      <FilterPill active={filters.person === ""} label={labels.all} onClick={() => onChange({ ...filters, person: "" })} />
      {people.map((name) => (
        <FilterPill
          key={name}
          active={filters.person === name}
          label={name}
          onClick={() => onChange({ ...filters, person: name })}
        />
      ))}
    </FilterRow>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[7rem_1fr] sm:items-start">
      <p className="m-0 pt-1.5 text-sm font-semibold text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold ${
        active ? "border-accent bg-accent-soft text-accent" : "border-line bg-white text-muted"
      }`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

type FilterLabels = ReturnType<typeof useFilterLabels>;

function useFilterLabels() {
  const t = useTranslations("me");
  const catalog = useTranslations("catalog");
  return {
    when: t("noticeFilterWhen"),
    kind: t("noticeFilterKind"),
    person: t("noticeFilterPerson"),
    status: t("noticeFilterStatus"),
    all: catalog("all"),
    reset: catalog("resetFilters"),
    unread: t("noticeFilterUnread"),
    whenOf: {
      all: catalog("all"),
      today: t("noticeFilterToday"),
      week: t("noticeFilterWeek"),
      month: t("noticeFilterMonth"),
    } satisfies Record<NoticeWhen, string>,
    kindOf: {
      all: catalog("all"),
      request: t("noticeFilterRequest"),
      confirmed: t("noticeFilterConfirmed"),
      cancelled: t("noticeFilterCancelled"),
      rescheduled: t("noticeFilterRescheduled"),
      other: t("noticeFilterOther"),
    } satisfies Record<NoticeKind | "all", string>,
  };
}
