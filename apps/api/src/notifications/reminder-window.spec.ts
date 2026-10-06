import { dueReminder, reminderKey } from "./reminder-window";

describe("dueReminder", () => {
  const start = new Date("2026-10-08T05:30:00.000Z");
  const bookedEarly = new Date("2026-10-01T05:30:00.000Z");

  it("opens the day reminder at the same clock time the day before", () => {
    expect(dueReminder(start, new Date(start.getTime() - 24 * 60 * 60 * 1000), bookedEarly)).toBe("day");
    expect(dueReminder(start, new Date(start.getTime() - 24 * 60 * 60 * 1000 - 1), bookedEarly)).toBeNull();
  });

  it("switches to the hour reminder one hour before the start", () => {
    expect(dueReminder(start, new Date(start.getTime() - 60 * 60 * 1000), bookedEarly)).toBe("hour");
    expect(dueReminder(start, new Date(start.getTime() - 1), bookedEarly)).toBe("hour");
    expect(dueReminder(start, start, bookedEarly)).toBeNull();
  });

  it("skips a reminder when the visit was booked after that moment", () => {
    const bookedLate = new Date(start.getTime() - 3 * 60 * 60 * 1000);
    expect(dueReminder(start, new Date(start.getTime() - 20 * 60 * 60 * 1000), bookedLate)).toBeNull();
    expect(dueReminder(start, new Date(start.getTime() - 30 * 60 * 1000), bookedLate)).toBe("hour");
    expect(dueReminder(start, new Date(start.getTime() - 30 * 60 * 1000), new Date(start.getTime() - 20 * 60 * 1000))).toBeNull();
  });

  it("keeps a moved visit on its own key", () => {
    const first = reminderKey("visit", "user", "day", start);
    const moved = reminderKey("visit", "user", "day", new Date(start.getTime() + 60 * 60 * 1000));
    expect(first).not.toBe(moved);
  });
});
