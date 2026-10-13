"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/ui/cn";

export type NoticePending = "selected" | "read" | null;

export function NoticeToolbar({
  query,
  placeholder,
  selecting,
  selectedCount,
  allSelected,
  pending,
  busy,
  filtersOpen,
  filtersActive,
  panelId,
  onQuery,
  onStart,
  onCancel,
  onToggleAll,
  onPending,
  onConfirm,
  onToggleFilters,
}: {
  query: string;
  placeholder: string;
  selecting: boolean;
  selectedCount: number;
  allSelected: boolean;
  pending: NoticePending;
  busy: boolean;
  filtersOpen: boolean;
  filtersActive: boolean;
  panelId: string;
  onQuery: (value: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onToggleAll: () => void;
  onPending: (pending: NoticePending) => void;
  onConfirm: () => void;
  onToggleFilters: () => void;
}) {
  const t = useTranslations("me");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NoticeSearch
        query={query}
        placeholder={placeholder}
        filtersOpen={filtersOpen}
        filtersActive={filtersActive}
        panelId={panelId}
        onQuery={onQuery}
        onToggleFilters={onToggleFilters}
      />
      {pending ? (
        <ConfirmActions pending={pending} count={selectedCount} busy={busy} onConfirm={onConfirm} onCancel={() => onPending(null)} />
      ) : selecting ? (
        <SelectActions
          allSelected={allSelected}
          selectedCount={selectedCount}
          busy={busy}
          onToggleAll={onToggleAll}
          onDelete={() => onPending("selected")}
          onDeleteRead={() => onPending("read")}
          onCancel={onCancel}
        />
      ) : (
        <button className="btn btn-secondary min-h-10 w-fit px-4" type="button" onClick={onStart}>
          {t("selectNotices")}
        </button>
      )}
    </div>
  );
}

function NoticeSearch({
  query,
  placeholder,
  filtersOpen,
  filtersActive,
  panelId,
  onQuery,
  onToggleFilters,
}: {
  query: string;
  placeholder: string;
  filtersOpen: boolean;
  filtersActive: boolean;
  panelId: string;
  onQuery: (value: string) => void;
  onToggleFilters: () => void;
}) {
  const catalog = useTranslations("catalog");
  return (
    <div className="search-shell min-w-0 flex-1">
      <span className="grid shrink-0 place-items-center pl-1 text-muted">
        <SearchIcon />
      </span>
      <input
        value={query}
        placeholder={placeholder}
        aria-label={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="min-w-0 flex-1 border-0 bg-transparent py-2 outline-none placeholder:text-[#9aa6a5]"
        onChange={(event) => onQuery(event.target.value)}
      />
      <button
        type="button"
        className={cn(
          "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent text-muted transition-[background,color] duration-160 hover:bg-sand hover:text-accent",
          (filtersOpen || filtersActive) && "bg-accent-soft text-accent",
        )}
        aria-label={catalog("openFilters")}
        aria-expanded={filtersOpen}
        aria-controls={panelId}
        onClick={onToggleFilters}
      >
        <FilterIcon />
      </button>
    </div>
  );
}

function ConfirmActions({
  pending,
  count,
  busy,
  onConfirm,
  onCancel,
}: {
  pending: Exclude<NoticePending, null>;
  count: number;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("me");
  const common = useTranslations("common");
  const question = pending === "selected" ? t("confirmDeleteNotices", { count }) : t("confirmDeleteReadNotices");
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <p className="m-0 text-sm font-semibold">{question}</p>
      <button className="btn btn-danger min-h-10 w-fit px-4" type="button" disabled={busy} onClick={onConfirm}>
        {t("deleteNotice")}
      </button>
      <button className="btn btn-secondary min-h-10 w-fit px-4" type="button" disabled={busy} onClick={onCancel}>
        {common("cancel")}
      </button>
    </span>
  );
}

function SelectActions({
  allSelected,
  selectedCount,
  busy,
  onToggleAll,
  onDelete,
  onDeleteRead,
  onCancel,
}: {
  allSelected: boolean;
  selectedCount: number;
  busy: boolean;
  onToggleAll: () => void;
  onDelete: () => void;
  onDeleteRead: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("me");
  const common = useTranslations("common");
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <p className="m-0 text-sm font-semibold">{t("noticeSelectedCount", { count: selectedCount })}</p>
      <button className="btn btn-secondary min-h-10 w-fit px-4" type="button" disabled={busy} onClick={onToggleAll}>
        {allSelected ? t("clearNoticeSelection") : t("selectAllNotices")}
      </button>
      <button className="btn btn-danger min-h-10 w-fit px-4" type="button" disabled={busy || selectedCount === 0} onClick={onDelete}>
        {t("deleteNotice")}
      </button>
      <button className="btn btn-ghost min-h-10 w-fit px-2" type="button" disabled={busy} onClick={onDeleteRead}>
        {t("deleteReadNotices")}
      </button>
      <button className="btn btn-secondary min-h-10 w-fit px-4" type="button" disabled={busy} onClick={onCancel}>
        {common("cancel")}
      </button>
    </span>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-[18px] w-[18px]">
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
