"use client";

import { useTranslations } from "next-intl";

export type NoticePending = "selected" | "read" | null;

export function NoticeToolbar({
  query,
  placeholder,
  selecting,
  selectedCount,
  allSelected,
  pending,
  busy,
  onQuery,
  onStart,
  onCancel,
  onToggleAll,
  onPending,
  onConfirm,
}: {
  query: string;
  placeholder: string;
  selecting: boolean;
  selectedCount: number;
  allSelected: boolean;
  pending: NoticePending;
  busy: boolean;
  onQuery: (value: string) => void;
  onStart: () => void;
  onCancel: () => void;
  onToggleAll: () => void;
  onPending: (pending: NoticePending) => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("me");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <NoticeSearch query={query} placeholder={placeholder} onQuery={onQuery} />
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

function NoticeSearch({ query, placeholder, onQuery }: { query: string; placeholder: string; onQuery: (value: string) => void }) {
  return (
    <label className="search-shell min-w-0 flex-1">
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
    </label>
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
