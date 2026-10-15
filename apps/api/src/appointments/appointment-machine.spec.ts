import { AppError } from "../common/app-error";
import { assertTransition, toStatusOf, transitionOf } from "./appointment-machine";

const future = new Date("2026-10-20T10:00:00.000Z");
const past = new Date("2026-10-01T10:00:00.000Z");
const now = new Date("2026-10-14T10:00:00.000Z");

describe("appointment machine", () => {
  it("confirms a request before the start", () => {
    expect(transitionOf({ type: "CONFIRMED" })).toEqual({
      from: ["REQUESTED"],
      to: "CONFIRMED",
      gate: "before-start",
    });
    assertTransition(open("REQUESTED", future), { type: "CONFIRMED" }, now);
  });

  it("rejects confirm after the start", () => {
    expect(thrownCode(open("REQUESTED", past), { type: "CONFIRMED" })).toBe("VISIT_STARTED");
  });

  it("completes and marks a miss only after the start", () => {
    expect(transitionOf({ type: "COMPLETED" }).gate).toBe("after-start");
    assertTransition(open("CONFIRMED", past), { type: "COMPLETED" }, now);
    assertTransition(open("CONFIRMED", past), { type: "NO_SHOW" }, now);
    expect(thrownCode(open("CONFIRMED", future), { type: "COMPLETED" })).toBe("VISIT_NOT_STARTED");
    expect(thrownCode(open("CONFIRMED", future), { type: "NO_SHOW" })).toBe("VISIT_NOT_STARTED");
  });

  it("cancels an open visit before the start", () => {
    assertTransition(open("REQUESTED", future), { type: "CANCELLED", reason: "busy" }, now);
    assertTransition(open("CONFIRMED", future), { type: "CANCELLED", reason: null }, now);
    expect(thrownCode(open("CONFIRMED", past), { type: "CANCELLED", reason: null })).toBe("VISIT_STARTED");
  });

  it("keeps reschedule on the same row and records the new status", () => {
    const move = {
      type: "RESCHEDULED" as const,
      startsAt: future,
      endsAt: new Date(future.getTime() + 30 * 60_000),
      status: "REQUESTED" as const,
      proposedBy: "STAFF" as const,
    };
    expect(toStatusOf(move)).toBe("REQUESTED");
    expect(transitionOf(move).from).toEqual(["REQUESTED", "CONFIRMED"]);
    assertTransition(open("CONFIRMED", future), move, now);
  });

  it("blocks transitions out of a closed visit", () => {
    expect(thrownCode(open("COMPLETED", past), { type: "CANCELLED", reason: null })).toBe("NOT_FOUND");
    expect(thrownCode(open("CANCELLED", future), { type: "CONFIRMED" })).toBe("NOT_FOUND");
    expect(thrownCode(open("EXPIRED", past), { type: "NO_SHOW" })).toBe("NOT_FOUND");
  });
});

function open(status: "REQUESTED" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "EXPIRED" | "NO_SHOW", startsAt: Date) {
  return { id: "visit-1", status, startsAt, endsAt: new Date(startsAt.getTime() + 30 * 60_000) };
}

function thrownCode(current: ReturnType<typeof open>, command: Parameters<typeof assertTransition>[1]): string {
  try {
    assertTransition(current, command, now);
    return "NONE";
  } catch (error) {
    if (error instanceof AppError) return error.code;
    throw error;
  }
}
