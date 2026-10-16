import { describe, expect, it } from "vitest";
import { todayYerevan, visitStarted } from "./visit-time";

describe("visit time guards", () => {
  it("distinguishes started and future visits", () => {
    const now = Date.parse("2026-10-15T12:00:00.000Z");
    expect(visitStarted("2026-10-15T11:59:59.000Z", now)).toBe(true);
    expect(visitStarted("2026-10-15T12:00:01.000Z", now)).toBe(false);
  });

  it("uses the Yerevan calendar day", () => {
    expect(todayYerevan(new Date("2026-01-01T20:30:00.000Z"))).toBe("2026-01-02");
  });
});
