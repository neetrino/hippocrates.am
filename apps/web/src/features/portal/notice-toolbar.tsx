"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/ui/cn";

export type NoticePending = "selected" | "read" | null;

export function NoticeToolbar({
  selecting,
  selectedCount,
  allSelected,
  pending,
  busy,
  filtersOpen,
  filtersActive,
  panelId,
  onStart,
  onCancel,
  onToggleAll,
  onPending,
  onConfirm,
  onToggleFilters,
}: {
  selecting: boolean;
  selectedCount: number;
  allSelected: boolean;
  pending: NoticePending;
  busy: boolean;
  filtersOpen: boolean;
  filtersActive: boolean;
  panelId: string;
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
      <FilterButton open={filtersOpen} active={filtersActive} panelId={panelId} onToggle={onToggleFilters} />
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

function FilterButton({
  open,
  active,
  panelId,
  onToggle,
}: {
  open: boolean;
  active: boolean;
  panelId: string;
  onToggle: () => void;
}) {
  const catalog = useTranslations("catalog");
  return (
    <button
      type="button"
      className={cn(
        "grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-white text-muted transition-[background,color,border-color] duration-160 hover:border-accent/35 hover:text-accent",
        (open || active) && "border-accent bg-accent-soft text-accent",
      )}
      aria-label={catalog("openFilters")}
      aria-expanded={open}
      aria-controls={panelId}
      onClick={onToggle}
    >
      <FilterIcon />
    </button>
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
