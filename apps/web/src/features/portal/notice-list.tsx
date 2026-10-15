"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { deleteNotices, deleteReadNotices, markNoticesRead } from "@/features/portal/notice-api";
import { NoticeFilterPanel } from "@/features/portal/notice-filter-panel";
import {
  emptyNoticeFilters,
  matchesNoticeFilters,
  noticeFiltersActive,
  noticePersonNames,
  type NoticeFilters,
} from "@/features/portal/notice-filters";
import { NoticeCard, NoticeMore } from "@/features/portal/notice-card";
import { NoticeToolbar, type NoticePending } from "@/features/portal/notice-toolbar";
import { noticePreviewLimit } from "@/shared/notice";
import type { NoticeKind } from "@/shared/notice-text";

export type NoticeRow = {
  id: string;
  text: string;
  when: string;
  context: string;
  unread: boolean;
  startsAt: string | null;
  kind: NoticeKind;
  people: string[];
};

export function NoticeList({ rows: initial }: { rows: NoticeRow[] }) {
  const list = useNoticeList(initial);
  const view = useNoticeView(list.rows, list.unreadIds);
  const t = useTranslations("me");
  const hidden = view.narrowing ? 0 : view.visible.length - noticePreviewLimit;
  const shown = view.narrowing || list.open || hidden <= 0 ? view.visible : view.visible.slice(0, noticePreviewLimit);
  if (list.rows.length === 0) {
    return <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>;
  }
  return (
    <div className="grid gap-3">
      <NoticeCommands list={list} view={view} />
      {list.failed ? <p className="m-0 text-sm text-danger">{t("deleteNoticesFailed")}</p> : null}
      {view.visible.length === 0 ? <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noticeSearchEmpty")}</p> : null}
      {shown.map((row) => (
        <NoticeCard
          key={row.id}
          row={{ ...row, unread: list.unreadIds.has(row.id) }}
          selecting={list.selecting}
          checked={list.selected.has(row.id)}
          onToggle={() => list.toggle(row.id)}
        />
      ))}
      <NoticeMore
        open={list.open}
        hidden={hidden}
        lessLabel={t("showLess")}
        moreLabel={t("showMore", { count: hidden })}
        onToggle={() => list.setOpen((value) => !value)}
      />
    </div>
  );
}

function useNoticeView(rows: NoticeRow[], unreadIds: Set<string>) {
  const [filters, setFilters] = useState<NoticeFilters>(emptyNoticeFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const panelId = useId();
  const visible = rows.filter((row) => matchesNoticeFilters(row, filters, unreadIds.has(row.id)));
  return {
    filters,
    setFilters,
    filtersOpen,
    setFiltersOpen,
    panelId,
    visible,
    people: noticePersonNames(rows),
    filtersActive: noticeFiltersActive(filters),
    narrowing: noticeFiltersActive(filters),
  };
}

function NoticeCommands({
  list,
  view,
}: {
  list: ReturnType<typeof useNoticeList>;
  view: ReturnType<typeof useNoticeView>;
}) {
  return (
    <>
      <NoticeToolbar
        selecting={list.selecting}
        selectedCount={list.selected.size}
        allSelected={view.visible.length > 0 && view.visible.every((row) => list.selected.has(row.id))}
        pending={list.pending}
        busy={list.busy}
        filtersOpen={view.filtersOpen}
        filtersActive={view.filtersActive}
        panelId={view.panelId}
        onStart={list.start}
        onCancel={list.cancel}
        onToggleAll={() => list.toggleVisible(view.visible.map((row) => row.id))}
        onPending={list.setPending}
        onConfirm={() => void list.confirm()}
        onToggleFilters={() => view.setFiltersOpen((open) => !open)}
      />
      <NoticeFilterPanel
        id={view.panelId}
        open={view.filtersOpen}
        filters={view.filters}
        people={view.people}
        onChange={view.setFilters}
        onReset={() => view.setFilters(emptyNoticeFilters)}
      />
    </>
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

  async function confirm(): Promise<void> {
    await confirmDelete(
      pending,
      busy,
      rows,
      selected,
      readTask.current,
      unreadIds,
      setRows,
      setSelected,
      setPending,
      setBusy,
      setFailed,
      setSelecting,
    );
  }

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
      unreadIds,
      setRows,
      setSelected,
      setPending,
      setBusy,
      setFailed,
      setSelecting,
    }),
    confirm,
  };
}

type NoticeActionInput = {
  pending: NoticePending;
  busy: boolean;
  rows: NoticeRow[];
  selected: Set<string>;
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
    toggleVisible: (ids: string[]) => {
      const every = ids.length > 0 && ids.every((id) => input.selected.has(id));
      input.setSelected(every ? new Set() : new Set(ids));
    },
    toggle: (id: string) => input.setSelected(toggleId(input.selected, id)),
  };
}

async function confirmDelete(
  pending: NoticePending,
  busy: boolean,
  rows: NoticeRow[],
  selected: Set<string>,
  readTask: Promise<boolean>,
  unreadIds: Set<string>,
  setRows: (rows: NoticeRow[]) => void,
  setSelected: (selected: Set<string>) => void,
  setPending: (pending: NoticePending) => void,
  setBusy: (busy: boolean) => void,
  setFailed: (failed: boolean) => void,
  setSelecting: (selecting: boolean) => void,
): Promise<void> {
  if (!pending || busy) return;
  setBusy(true);
  setFailed(false);
  const next = await nextRows(pending, readTask, unreadIds, rows, selected);
  setBusy(false);
  if (!next) {
    setFailed(true);
    return;
  }
  setRows(next);
  setSelected(new Set());
  setPending(null);
  if (next.length === 0) setSelecting(false);
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
