import type { Prisma } from "../generated/prisma/client";
import { AppError } from "../common/app-error";

const NOTICE_PAGE_DEFAULT = 20;
const NOTICE_PAGE_MAX = 50;
const NOTICE_ID_MAX = 40;
const CURSOR_MAX = 180;
const noticeIdPattern = /^[a-z0-9]+$/i;
const cursorTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export type NoticeCursor = { createdAt: Date; id: string };

export function emptyNoticePage(): {
  items: [];
  nextCursor: null;
  hasMore: false;
  unreadCount: 0;
} {
  return { items: [], nextCursor: null, hasMore: false, unreadCount: 0 };
}

/** Query `limit`. Missing means the default page. Out of range is rejected. */
export function readNoticeLimit(raw: unknown): number {
  if (raw === undefined || raw === "") return NOTICE_PAGE_DEFAULT;
  if (typeof raw !== "string" || !/^\d{1,2}$/.test(raw)) throw invalidNoticePage();
  const limit = Number(raw);
  if (limit < 1 || limit > NOTICE_PAGE_MAX) throw invalidNoticePage();
  return limit;
}

/** Opaque `{ createdAt, id }` cursor. Missing means the first page. */
export function readNoticeCursor(raw: unknown): NoticeCursor | null {
  if (raw === undefined || raw === "") return null;
  if (typeof raw !== "string" || raw.length > CURSOR_MAX) throw invalidNoticePage();
  const parsed = parseCursor(raw);
  if (!parsed) throw invalidNoticePage();
  return parsed;
}

export function encodeNoticeCursor(createdAt: Date, id: string): string {
  return Buffer.from(JSON.stringify({ t: createdAt.toISOString(), id }), "utf8").toString("base64url");
}

export function noticeListWhere(userId: string, cursor: NoticeCursor | null): Prisma.NotificationWhereInput {
  if (!cursor) return { userId };
  return {
    userId,
    OR: [
      { createdAt: { lt: cursor.createdAt } },
      { createdAt: cursor.createdAt, id: { lt: cursor.id } },
    ],
  };
}

/** `rows` is `limit + 1` so the extra row can set `hasMore` without a second count. */
export function sliceNoticePage<T extends { id: string; createdAt: Date }>(
  rows: readonly T[],
  limit: number,
): { items: T[]; hasMore: boolean; nextCursor: string | null } {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : [...rows];
  const last = items.at(-1);
  return {
    items,
    hasMore,
    nextCursor: hasMore && last ? encodeNoticeCursor(last.createdAt, last.id) : null,
  };
}

function parseCursor(raw: string): NoticeCursor | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || !("t" in parsed) || !("id" in parsed)) return null;
  const time = parsed.t;
  const id = parsed.id;
  if (typeof time !== "string" || !cursorTimePattern.test(time)) return null;
  if (typeof id !== "string" || !noticeIdPattern.test(id) || id.length > NOTICE_ID_MAX) return null;
  return { createdAt: new Date(time), id };
}

function invalidNoticePage(): AppError {
  return new AppError("VALIDATION_FAILED", 400, "Ծանուցումը սխալ է");
}
