import { AppError } from "./app-error";
import { LIST_PAGE_SIZE, pageWindow } from "./pagination";

describe("pageWindow", () => {
  it("uses the first 50-row page by default", () => {
    expect(pageWindow(undefined)).toEqual({ page: 1, skip: 0, take: LIST_PAGE_SIZE });
  });

  it("calculates a bounded offset", () => {
    expect(pageWindow("3")).toEqual({ page: 3, skip: 100, take: LIST_PAGE_SIZE });
  });

  it.each(["0", "-1", "1.5", "abc", "10001"])("rejects an invalid page: %s", (value) => {
    expect(() => pageWindow(value)).toThrow(AppError);
  });
});
