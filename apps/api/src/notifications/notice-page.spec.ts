import { AppError } from "../common/app-error";
import { encodeNoticeCursor, noticeListWhere, readNoticeCursor, readNoticeLimit, sliceNoticePage } from "./notice-page";

describe("readNoticeLimit", () => {
  it("uses the default page and rejects an out-of-range limit", () => {
    expect(readNoticeLimit(undefined)).toBe(20);
    expect(readNoticeLimit("50")).toBe(50);
    expect(() => readNoticeLimit("0")).toThrow(AppError);
    expect(() => readNoticeLimit("51")).toThrow(AppError);
    expect(() => readNoticeLimit("abc")).toThrow(AppError);
  });
});

describe("notice cursor", () => {
  const createdAt = new Date("2026-10-16T08:00:00.000Z");

  it("round-trips an opaque cursor and rejects a broken one", () => {
    const cursor = encodeNoticeCursor(createdAt, "clabc");
    expect(readNoticeCursor(cursor)).toEqual({ createdAt, id: "clabc" });
    expect(readNoticeCursor(undefined)).toBeNull();
    expect(() => readNoticeCursor("not-a-cursor")).toThrow(AppError);
  });

  it("keeps the extra row as hasMore and continues after the last id", () => {
    const rows = [0, 1, 2].map((index) => ({
      id: `id${index}`,
      createdAt: new Date(`2026-10-16T08:00:0${index}.000Z`),
    }));
    const page = sliceNoticePage(rows, 2);
    expect(page.items.map((row) => row.id)).toEqual(["id0", "id1"]);
    expect(page.hasMore).toBe(true);
    expect(page.nextCursor).toBe(encodeNoticeCursor(rows[1].createdAt, "id1"));
    expect(sliceNoticePage(rows, 3)).toMatchObject({ hasMore: false, nextCursor: null });
  });

  it("pages older rows with the same timestamp by id", () => {
    const where = noticeListWhere("user", { createdAt, id: "clmid" });
    expect(where).toEqual({
      userId: "user",
      OR: [{ createdAt: { lt: createdAt } }, { createdAt, id: { lt: "clmid" } }],
    });
  });
});
