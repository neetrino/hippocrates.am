import { AppError } from "../common/app-error";
import { readNoticeIds } from "./notice-ids";

describe("readNoticeIds", () => {
  it("returns unique ids", () => {
    expect(readNoticeIds({ ids: ["abc", "abc", "def"] })).toEqual(["abc", "def"]);
  });

  it("rejects an empty list and a non-id", () => {
    expect(() => readNoticeIds({ ids: [] })).toThrow(AppError);
    expect(() => readNoticeIds({ ids: ["bad id"] })).toThrow(AppError);
    expect(() => readNoticeIds({})).toThrow(AppError);
  });
});
