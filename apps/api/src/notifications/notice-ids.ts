import { AppError } from "../common/app-error";

const NOTICE_ID_MAX = 40;
const NOTICE_DELETE_MAX = 50;

/** Ids the signed-in user asked to delete. Ownership is checked in the query. */
export function readNoticeIds(body: unknown): string[] {
  const ids = noticeIdList(body);
  const unique = new Set<string>();
  for (const id of ids) unique.add(noticeId(id));
  return [...unique];
}

function noticeIdList(body: unknown): unknown[] {
  if (!body || typeof body !== "object" || !("ids" in body)) {
    throw new AppError("VALIDATION_FAILED", 400, "Ծանուցումը սխալ է");
  }
  const ids = body.ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > NOTICE_DELETE_MAX) {
    throw new AppError("VALIDATION_FAILED", 400, "Ծանուցումը սխալ է");
  }
  return ids;
}

function noticeId(id: unknown): string {
  if (typeof id !== "string" || !/^[a-z0-9]+$/i.test(id) || id.length > NOTICE_ID_MAX) {
    throw new AppError("VALIDATION_FAILED", 400, "Ծանուցումը սխալ է");
  }
  return id;
}
