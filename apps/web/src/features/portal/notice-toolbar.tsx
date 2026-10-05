"use client";

import { useTranslations } from "next-intl";

export type NoticePending = "selected" | "read" | null;

const pill =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent disabled:cursor-default disabled:opacity-50";
const danger =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-danger/30 bg-white px-4 py-2.5 text-sm font-semibold text-danger transition-colors duration-160 hover:bg-danger/10 disabled:cursor-default disabled:opacity-50";

export function NoticeToolbar({
  selecting,
  selectedCount,
  allSelected,
  pending,
  busy,
  onStart,
  onCancel,
  onToggleAll,
  onPending,
  onConfirm,
}: {
  selecting: boolean;
  selectedCount: number;
  allSelected: boolean;
  pending: NoticePending;
  busy: boolean;
  onStart: () => void;
  onCancel: () => void;
  onToggleAll: () => void;
  onPending: (pending: NoticePending) => void;
  onConfirm: () => void;
}) {
  if (pending) return <ConfirmBar pending={pending} count={selectedCount} busy={busy} onConfirm={onConfirm} onCancel={() => onPending(null)} />;
  if (selecting) {
    return (
      <SelectBar
        allSelected={allSelected}
        selectedCount={selectedCount}
        busy={busy}
        onToggleAll={onToggleAll}
        onDelete={() => onPending("selected")}
        onCancel={onCancel}
      />
    );
  }
  return <IdleBar onStart={onStart} onDeleteRead={() => onPending("read")} />;
}

function ConfirmBar({
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
    <div className="flex flex-wrap items-center gap-2">
      <p className="m-0 mr-auto text-sm font-semibold text-ink">{question}</p>
      <button type="button" className={danger} disabled={busy} onClick={onConfirm}>
        {t("deleteNotice")}
      </button>
      <button type="button" className={pill} disabled={busy} onClick={onCancel}>
        {common("cancel")}
      </button>
    </div>
  );
}

function SelectBar({
  allSelected,
  selectedCount,
  busy,
  onToggleAll,
  onDelete,
  onCancel,
}: {
  allSelected: boolean;
  selectedCount: number;
  busy: boolean;
  onToggleAll: () => void;
  onDelete: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("me");
  const common = useTranslations("common");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={pill} disabled={busy} onClick={onToggleAll}>
        {allSelected ? t("clearNoticeSelection") : t("selectAllNotices")}
      </button>
      <button type="button" className={danger} disabled={busy || selectedCount === 0} onClick={onDelete}>
        {t("deleteNotices", { count: selectedCount })}
      </button>
      <button type="button" className={pill} disabled={busy} onClick={onCancel}>
        {common("cancel")}
      </button>
    </div>
  );
}

function IdleBar({ onStart, onDeleteRead }: { onStart: () => void; onDeleteRead: () => void }) {
  const t = useTranslations("me");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" className={pill} onClick={onStart}>
        {t("selectNotices")}
      </button>
      <button type="button" className={danger} onClick={onDeleteRead}>
        {t("deleteReadNotices")}
      </button>
    </div>
  );
}
