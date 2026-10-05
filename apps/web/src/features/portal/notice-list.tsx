"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { deleteNotices, deleteReadNotices, markNoticesRead } from "@/features/portal/notice-api";
import { NoticeToolbar, type NoticePending } from "@/features/portal/notice-toolbar";
import { noticePreviewLimit } from "@/shared/notice";

export type NoticeRow = {
  id: string;
  text: string;
  when: string;
  context: string;
  unread: boolean;
};

export function NoticeList({ rows: initial }: { rows: NoticeRow[] }) {
  const list = useNoticeList(initial);
  const t = useTranslations("me");
  if (list.rows.length === 0) {
    return <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>;
  }
  const hidden = list.rows.length - noticePreviewLimit;
  const shown = list.open || hidden <= 0 ? list.rows : list.rows.slice(0, noticePreviewLimit);
  return (
    <div className="grid gap-3">
      <NoticeToolbar
        selecting={list.selecting}
        selectedCount={list.selected.size}
        allSelected={list.selected.size === list.rows.length}
        pending={list.pending}
        busy={list.busy}
        onStart={list.start}
        onCancel={list.cancel}
        onToggleAll={list.toggleAll}
        onPending={list.setPending}
        onConfirm={() => void list.confirm()}
      />
      {list.failed ? <p className="m-0 text-sm text-danger">{t("deleteNoticesFailed")}</p> : null}
      {shown.map((row) => (
        <NoticeCard
          key={row.id}
          row={{ ...row, unread: list.unreadIds.has(row.id) }}
          selecting={list.selecting}
          checked={list.selected.has(row.id)}
          onToggle={() => list.toggle(row.id)}
        />
      ))}
      {hidden > 0 ? (
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent"
          aria-expanded={list.open}
          onClick={() => list.setOpen((value) => !value)}
        >
          {list.open ? t("showLess") : t("showMore", { count: hidden })}
          <Chevron open={list.open} />
        </button>
      ) : null}
    </div>
  );
}

function useNoticeList(initial: NoticeRow[]) {
  const unreadIds = useState(() => new Set(initial.filter((row) => row.unread).map((row) => row.id)))[0];
  const readTask = useRef<Promise<boolean>>(Promise.resolve(unreadIds.size === 0));
  const [rows, setRows] = useState(initial);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<NoticePending>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (unreadIds.size === 0) return;
    readTask.current = markNoticesRead();
  }, [unreadIds]);

  return {
    unreadIds,
    rows,
    selecting,
    selected,
    pending,
    busy,
    failed,
    open,
    setOpen,
    ...noticeActions({
      pending,
      busy,
      rows,
      selected,
      readTask,
      unreadIds,
      setRows,
      setSelected,
      setPending,
      setBusy,
      setFailed,
      setSelecting,
    }),
  };
}

type NoticeActionInput = {
  pending: NoticePending;
  busy: boolean;
  rows: NoticeRow[];
  selected: Set<string>;
  readTask: RefObject<Promise<boolean>>;
  unreadIds: Set<string>;
  setRows: (rows: NoticeRow[]) => void;
  setSelected: (selected: Set<string>) => void;
  setPending: (pending: NoticePending) => void;
  setBusy: (busy: boolean) => void;
  setFailed: (failed: boolean) => void;
  setSelecting: (selecting: boolean) => void;
};

function noticeActions(input: NoticeActionInput) {
  return {
    setPending: (value: NoticePending) => {
      input.setFailed(false);
      input.setPending(value);
    },
    start: () => {
      input.setSelecting(true);
      input.setPending(null);
      input.setFailed(false);
    },
    cancel: () => {
      input.setSelecting(false);
      input.setSelected(new Set());
      input.setPending(null);
      input.setFailed(false);
    },
    toggleAll: () => {
      const every = input.selected.size === input.rows.length;
      input.setSelected(every ? new Set() : new Set(input.rows.map((row) => row.id)));
    },
    toggle: (id: string) => input.setSelected(toggleId(input.selected, id)),
    confirm: () => confirmDelete(input),
  };
}

async function confirmDelete(input: NoticeActionInput): Promise<void> {
  const pending = input.pending;
  if (!pending || input.busy) return;
  input.setBusy(true);
  input.setFailed(false);
  const next = await nextRows(pending, input.readTask.current, input.unreadIds, input.rows, input.selected);
  input.setBusy(false);
  if (!next) {
    input.setFailed(true);
    return;
  }
  input.setRows(next);
  input.setSelected(new Set());
  input.setPending(null);
  if (next.length === 0) input.setSelecting(false);
}

async function nextRows(
  pending: Exclude<NoticePending, null>,
  readTask: Promise<boolean>,
  unreadIds: Set<string>,
  rows: NoticeRow[],
  selected: Set<string>,
): Promise<NoticeRow[] | null> {
  if (pending === "selected") return clearedSelected([...selected], rows);
  const marked = await readTask;
  const ok = await deleteReadNotices();
  if (!ok) return null;
  return marked ? [] : rows.filter((row) => unreadIds.has(row.id));
}

async function clearedSelected(ids: string[], rows: NoticeRow[]): Promise<NoticeRow[] | null> {
  if (ids.length === 0 || !(await deleteNotices(ids))) return null;
  const gone = new Set(ids);
  return rows.filter((row) => !gone.has(row.id));
}

function toggleId(selected: Set<string>, id: string): Set<string> {
  const next = new Set(selected);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

function NoticeCard({
  row,
  selecting,
  checked,
  onToggle,
}: {
  row: NoticeRow;
  selecting: boolean;
  checked: boolean;
  onToggle: () => void;
}) {
  const body = (
    <span className="min-w-0">
      <span className="flex items-start gap-2">
        {row.unread ? <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" /> : null}
        <span>{row.text}</span>
      </span>
      {row.context ? <span className="mt-1 block text-sm text-ink/80">{row.context}</span> : null}
      <time className="mt-1 block text-sm text-muted">{row.when}</time>
    </span>
  );
  const className = `rounded-[1.1rem] border px-4 py-3.5 ${cardTone(row.unread, checked)}`;
  if (!selecting) return <article className={className}>{body}</article>;
  return (
    <label className={`${className} flex cursor-pointer items-start gap-3`}>
      <input type="checkbox" className="mt-1 size-4 shrink-0 accent-accent" checked={checked} onChange={onToggle} />
      {body}
    </label>
  );
}

function cardTone(unread: boolean, checked: boolean): string {
  const edge = unread ? "border-l-4 border-l-accent" : "";
  if (checked) return `border-accent bg-accent-soft/70 ${edge}`;
  if (unread) return `border-line bg-accent-soft/70 ${edge}`;
  return "border-line bg-sand/70";
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`h-4 w-4 ${open ? "rotate-180" : ""}`} aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
