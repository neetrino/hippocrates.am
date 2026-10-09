import { AppError } from "../common/app-error";
import { financeWindow } from "./finance-range";

describe("financeWindow", () => {
  it("is open when both dates are missing", () => {
    expect(financeWindow(undefined, undefined, "Asia/Yerevan")).toBeUndefined();
  });

  it("rejects a one-sided range", () => {
    expect(() => financeWindow("2026-10-01", undefined, "Asia/Yerevan")).toThrow(AppError);
  });

  it("covers the clinic-local days, including the last day", () => {
    const window = financeWindow("2026-10-05", "2026-10-05", "Asia/Yerevan");
    expect(window?.gte.toISOString()).toBe("2026-10-04T20:00:00.000Z");
    expect(window?.lt.toISOString()).toBe("2026-10-05T20:00:00.000Z");
  });

  it("rejects an end before the start", () => {
    expect(() => financeWindow("2026-10-06", "2026-10-05", "Asia/Yerevan")).toThrow(AppError);
  });
});
