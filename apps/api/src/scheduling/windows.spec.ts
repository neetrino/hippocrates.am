import { AppError } from "../common/app-error";
import { assertInsideClinic, clipToClinic } from "./windows";

const clinic = [
  { weekday: 1, startMinute: 9 * 60, endMinute: 18 * 60 },
  { weekday: 2, startMinute: 10 * 60, endMinute: 16 * 60 },
];

describe("clipToClinic", () => {
  it("keeps the doctor week when the clinic has no hours", () => {
    const doctor = [{ weekday: 1, startMinute: 8 * 60, endMinute: 20 * 60 }];
    expect(clipToClinic([], doctor)).toEqual(doctor);
  });

  it("drops a day the clinic is closed and clips a longer day", () => {
    expect(
      clipToClinic(clinic, [
        { weekday: 1, startMinute: 8 * 60, endMinute: 20 * 60 },
        { weekday: 6, startMinute: 9 * 60, endMinute: 13 * 60 },
      ]),
    ).toEqual([{ weekday: 1, startMinute: 9 * 60, endMinute: 18 * 60 }]);
  });
});

describe("assertInsideClinic", () => {
  it("accepts a doctor week inside the clinic week", () => {
    expect(() =>
      assertInsideClinic(clinic, [{ weekday: 1, startMinute: 10 * 60, endMinute: 14 * 60 }]),
    ).not.toThrow();
  });

  it("rejects a day or span outside the clinic week", () => {
    expect(() =>
      assertInsideClinic(clinic, [{ weekday: 1, startMinute: 8 * 60, endMinute: 12 * 60 }]),
    ).toThrow(AppError);
    expect(() =>
      assertInsideClinic(clinic, [{ weekday: 6, startMinute: 10 * 60, endMinute: 12 * 60 }]),
    ).toThrow(AppError);
  });
});
