import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { deleteNotices, deleteReadNotices, fetchNoticePage, markNoticesRead } from "@/features/portal/notice-api";
import { toNoticeRows, type NoticeAudience, type NoticeRow } from "@/features/portal/notice-row";
import type { NoticePending } from "@/features/portal/notice-toolbar";
import type { NoticePage } from "@/shared/notice";
import type { NoticeMessageKey } from "@/shared/notice-text";

export function useNoticeList(page: NoticePage, audience: NoticeAudience) {
  const feed = useNoticeFeed(page, audience);
  const actions = useNoticeActions(feed);
  return { ...feed, ...actions };
}

function useNoticeFeed(page: NoticePage, audience: NoticeAudience) {
  const locale = useLocale();
  const t = useTranslations("me");
  const arrived = t("noticeArrived");
  const translate = (key: NoticeMessageKey) => t(key);
  const unreadIds = useState(() => new Set(page.items.filter((item) => item.readAt === null).map((item) => item.id)))[0];
  const readTask = useRef<Promise<boolean>>(Promise.resolve(unreadIds.size === 0));
  const [rows, setRows] = useState(() => toNoticeRows(page.items, locale, translate, arrived, audience));
  const [cursor, setCursor] = useState(page.nextCursor);
  const [hasMore, setHasMore] = useState(page.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (unreadIds.size === 0) return;
    readTask.current = markNoticesRead();
  }, [unreadIds]);

  async function loadMore(): Promise<void> {
    const next = await loadNoticePage(cursor, loadingMore, setLoadingMore, setLoadFailed);
    if (!next) return;
    setRows((current) => [...current, ...toNoticeRows(next.items, locale, translate, arrived, audience)]);
    setCursor(next.nextCursor);
    setHasMore(next.hasMore);
  }

  return { unreadIds, rows, setRows, readTask, hasMore, setHasMore, setCursor, loadingMore, loadFailed, loadMore };
}

type NoticeFeed = ReturnType<typeof useNoticeFeed>;

function useNoticeActions(feed: NoticeFeed) {
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [pending, setPending] = useState<NoticePending>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function confirm(): Promise<void> {
    const next = await confirmDelete(pending, busy, feed.rows, selected, feed.readTask.current, feed.unreadIds, setBusy, setFailed);
    if (!next) return;
    feed.setRows(next.rows);
    setSelected(new Set());
    setPending(null);
    if (next.rows.length === 0) setSelecting(false);
    if (!next.clearRest) return;
    feed.setHasMore(false);
    feed.setCursor(null);
  }

  return {
    selecting,
    selected,
    pending,
    busy,
    failed,
    confirm,
    ...noticeActions({ setFailed, setPending, setSelecting, setSelected, selected }),
  };
}

function noticeActions(input: {
  setFailed: (failed: boolean) => void;
  setPending: (pending: NoticePending) => void;
  setSelecting: (selecting: boolean) => void;
  setSelected: (selected: Set<string>) => void;
  selected: Set<string>;
}) {
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
  setBusy: (busy: boolean) => void,
  setFailed: (failed: boolean) => void,
): Promise<{ rows: NoticeRow[]; clearRest: boolean } | null> {
  if (!pending || busy) return null;
  setBusy(true);
  setFailed(false);
  const next = await nextRows(pending, readTask, unreadIds, rows, selected);
  setBusy(false);
  if (!next) setFailed(true);
  return next;
}

async function loadNoticePage(
  cursor: string | null,
  loadingMore: boolean,
  setLoadingMore: (loading: boolean) => void,
  setLoadFailed: (failed: boolean) => void,
): Promise<NoticePage | null> {
  if (!cursor || loadingMore) return null;
  setLoadingMore(true);
  setLoadFailed(false);
  const next = await fetchNoticePage(cursor);
  setLoadingMore(false);
  if (!next) setLoadFailed(true);
  return next;
}

async function nextRows(
  pending: Exclude<NoticePending, null>,
  readTask: Promise<boolean>,
  unreadIds: Set<string>,
  rows: NoticeRow[],
  selected: Set<string>,
): Promise<{ rows: NoticeRow[]; clearRest: boolean } | null> {
  if (pending === "selected") {
    const kept = await clearedSelected([...selected], rows);
    return kept ? { rows: kept, clearRest: false } : null;
  }
  const marked = await readTask;
  if (!(await deleteReadNotices())) return null;
  const clearRest = marked && unreadIds.size > 0;
  const kept = clearRest ? [] : rows.filter((row) => unreadIds.has(row.id));
  return { rows: kept, clearRest };
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
