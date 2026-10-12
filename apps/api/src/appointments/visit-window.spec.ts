import { rescheduleOutcome, visitHasStarted } from "./visit-window";

describe("visit window", () => {
  const start = new Date("2026-10-06T05:30:00.000Z");

  it("treats the start instant as already begun", () => {
    expect(visitHasStarted(start, start)).toBe(true);
    expect(visitHasStarted(start, new Date(start.getTime() - 1))).toBe(false);
  });

  it("asks the clinic to confirm a patient move", () => {
    expect(rescheduleOutcome(true, "CONFIRMED")).toEqual({ status: "REQUESTED", proposedBy: "PATIENT" });
    expect(rescheduleOutcome(true, "REQUESTED")).toEqual({ status: "REQUESTED", proposedBy: "PATIENT" });
  });

  it("asks the patient to accept a staff move of a confirmed visit", () => {
    expect(rescheduleOutcome(false, "CONFIRMED")).toEqual({ status: "REQUESTED", proposedBy: "STAFF" });
    expect(rescheduleOutcome(false, "REQUESTED")).toEqual({ status: "REQUESTED", proposedBy: "PATIENT" });
  });
});
