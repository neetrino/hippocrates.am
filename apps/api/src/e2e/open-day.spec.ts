import { upcomingWeekdays } from "./open-day";

describe("upcomingWeekdays", () => {
  it("skips today and the weekend in Yerevan", () => {
    expect(upcomingWeekdays(2, new Date("2026-10-16T12:00:00.000Z"))).toEqual(["2026-10-19", "2026-10-20"]);
    expect(upcomingWeekdays(2, new Date("2026-10-19T08:00:00.000Z"))).toEqual(["2026-10-20", "2026-10-21"]);
  });
});
