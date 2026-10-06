import { rescheduleStatus, visitHasStarted } from "./visit-window";

describe("visit window", () => {
  const start = new Date("2026-10-06T05:30:00.000Z");

  it("treats the start instant as already begun", () => {
    expect(visitHasStarted(start, start)).toBe(true);
    expect(visitHasStarted(start, new Date(start.getTime() - 1))).toBe(false);
  });

  it("returns a patient reschedule of a confirmed visit to requested", () => {
    expect(rescheduleStatus(true, "CONFIRMED")).toBe("REQUESTED");
    expect(rescheduleStatus(true, "REQUESTED")).toBe("REQUESTED");
    expect(rescheduleStatus(false, "CONFIRMED")).toBe("CONFIRMED");
    expect(rescheduleStatus(false, "REQUESTED")).toBe("REQUESTED");
  });
});
