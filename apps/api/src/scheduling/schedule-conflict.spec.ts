import { isScheduleConflict } from "./schedule-conflict";

describe("isScheduleConflict", () => {
  it("recognizes PostgreSQL exclusion violations", () => {
    expect(isScheduleConflict(new Error("database error 23P01"))).toBe(true);
    expect(isScheduleConflict(new Error("ScheduleException_no_overlap"))).toBe(true);
  });

  it("does not hide unrelated database errors", () => {
    expect(isScheduleConflict(new Error("connection failed"))).toBe(false);
    expect(isScheduleConflict(null)).toBe(false);
  });
});
