import { bookableStarts, daySlots } from "./slots";

describe("bookableStarts", () => {
  it("returns clinic-local slots and skips a busy interval", () => {
    const busyStart = bookableStarts({
      isoDate: "2026-10-05",
      timeZone: "Asia/Yerevan",
      windows: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }],
      durationMinutes: 60,
      busy: [],
      blocked: [],
    })[0];
    expect(busyStart).toBeDefined();
    const starts = bookableStarts({
      isoDate: "2026-10-05",
      timeZone: "Asia/Yerevan",
      windows: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }],
      durationMinutes: 60,
      busy: [{ start: busyStart!, end: new Date(busyStart!.getTime() + 60 * 60_000) }],
      blocked: [],
    });
    expect(starts).toHaveLength(1);
    expect(starts[0]?.toISOString()).toBe("2026-10-05T06:00:00.000Z");
    const shown = daySlots({
      isoDate: "2026-10-05",
      timeZone: "Asia/Yerevan",
      windows: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }],
      durationMinutes: 60,
      busy: [{ start: busyStart!, end: new Date(busyStart!.getTime() + 60 * 60_000) }],
      blocked: [],
    });
    expect(shown).toHaveLength(2);
    expect(shown[0]?.busy).toBe(true);
    expect(shown[1]?.busy).toBe(false);
  });
});
