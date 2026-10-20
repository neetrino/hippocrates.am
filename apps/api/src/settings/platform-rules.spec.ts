import { addCalendarDays, applyPatientSlots, patientBookingOpen, patientChangeOpen, platformDefaults, withinHorizon } from "./platform-rules";

describe("platform booking rules", () => {
  const zone = "Asia/Yerevan";
  const now = new Date("2026-10-20T08:00:00.000Z");

  it("keeps a day inside the horizon and rejects the day after it", () => {
    expect(withinHorizon("2026-12-19", "2026-10-20", 60)).toBe(true);
    expect(withinHorizon("2026-12-20", "2026-10-20", 60)).toBe(false);
    expect(addCalendarDays("2026-10-20", 60)).toBe("2026-12-19");
  });

  it("rejects a patient booking that is too soon or while booking is closed", () => {
    const soon = new Date("2026-10-20T09:00:00.000Z");
    const later = new Date("2026-10-20T12:00:00.000Z");
    expect(patientBookingOpen(platformDefaults, soon, zone, now)).toBe("too-soon");
    expect(patientBookingOpen(platformDefaults, later, zone, now)).toBe("ok");
    expect(patientBookingOpen({ ...platformDefaults, bookingEnabled: false }, later, zone, now)).toBe("closed");
  });

  it("closes a patient change once the deadline remains or has passed", () => {
    const start = new Date("2026-10-21T08:00:00.000Z");
    expect(patientChangeOpen(start, now, 1440)).toBe(false);
    expect(patientChangeOpen(start, new Date("2026-10-20T07:59:00.000Z"), 1440)).toBe(true);
  });

  it("marks public slots busy when they fall inside the notice window", () => {
    const slots = applyPatientSlots(
      [
        { startsAt: "2026-10-20T09:00:00.000Z", busy: false },
        { startsAt: "2026-10-20T12:00:00.000Z", busy: false },
      ],
      platformDefaults,
      "2026-10-20",
      zone,
      now,
    );
    expect(slots.map((slot) => slot.busy)).toEqual([true, false]);
  });
});
