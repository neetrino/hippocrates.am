import { bookableStarts, daySlots, openWindows } from "./slots";

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

  it("closes a slot that has already started and keeps a later one open", () => {
    const shown = daySlots({
      isoDate: "2026-10-05",
      timeZone: "Asia/Yerevan",
      windows: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }],
      durationMinutes: 60,
      busy: [],
      blocked: [],
      now: new Date("2026-10-05T05:30:00.000Z"),
    });
    expect(shown.map((slot) => slot.busy)).toEqual([true, false]);
    const open = bookableStarts({
      isoDate: "2026-10-05",
      timeZone: "Asia/Yerevan",
      windows: [{ weekday: 1, startMinute: 9 * 60, endMinute: 11 * 60 }],
      durationMinutes: 60,
      busy: [],
      blocked: [],
      now: new Date("2026-10-05T05:30:00.000Z"),
    });
    expect(open.map((start) => start.toISOString())).toEqual(["2026-10-05T06:00:00.000Z"]);
  });
});

describe("openWindows", () => {
  const doctor = [{ weekday: 1, startMinute: 9 * 60, endMinute: 17 * 60 }];

  it("keeps the doctor hours when the clinic has none", () => {
    expect(openWindows([], doctor)).toEqual(doctor);
  });

  it("keeps only the overlap of clinic and doctor hours", () => {
    const clinic = [
      { weekday: 1, startMinute: 10 * 60, endMinute: 18 * 60 },
      { weekday: 6, startMinute: 10 * 60, endMinute: 14 * 60 },
    ];
    expect(openWindows(clinic, doctor)).toEqual([{ weekday: 1, startMinute: 10 * 60, endMinute: 17 * 60 }]);
  });
});
