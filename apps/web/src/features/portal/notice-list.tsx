"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { NoticeFilterPanel } from "@/features/portal/notice-filter-panel";
import {
  emptyNoticeFilters,
  matchesNoticeFilters,
  noticeFiltersActive,
  noticePersonNames,
  type NoticeFilters,
} from "@/features/portal/notice-filters";
import { NoticeCard, NoticeLoadMore } from "@/features/portal/notice-card";
import { useNoticeList } from "@/features/portal/notice-list-state";
import type { NoticeAudience, NoticeRow } from "@/features/portal/notice-row";
import { NoticeToolbar } from "@/features/portal/notice-toolbar";
import type { NoticePage } from "@/shared/notice";

export type { NoticeRow };

export function NoticeList({ page, audience }: { page: NoticePage; audience: NoticeAudience }) {
  const list = useNoticeList(page, audience);
  const view = useNoticeView(list.rows, list.unreadIds);
  const t = useTranslations("me");
  if (list.rows.length === 0 && !list.hasMore) {
    return <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>;
  }
  return (
    <div className="grid gap-3">
      <NoticeCommands list={list} view={view} />
      {list.failed ? <p className="m-0 text-sm text-danger">{t("deleteNoticesFailed")}</p> : null}
      {list.loadFailed ? <p className="m-0 text-sm text-danger">{t("loadNoticesFailed")}</p> : null}
      {view.visible.length === 0 ? (
        <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{list.rows.length === 0 ? t("noNotices") : t("noticeSearchEmpty")}</p>
      ) : null}
      {view.visible.map((row) => (
        <NoticeCard
          key={row.id}
          row={{ ...row, unread: list.unreadIds.has(row.id) }}
          selecting={list.selecting}
          checked={list.selected.has(row.id)}
          onToggle={() => list.toggle(row.id)}
        />
      ))}
      {list.hasMore ? (
        <NoticeLoadMore label={t("loadMoreNotices")} pending={list.loadingMore} onLoad={() => void list.loadMore()} />
      ) : null}
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
