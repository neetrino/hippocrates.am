import { describe, expect, it } from "vitest";
import { groupVisits } from "./visit-order";

describe("groupVisits", () => {
  it("keeps a future visit upcoming and a started visit apart", () => {
    const now = Date.parse("2026-10-23T12:00:00Z");
    const groups = groupVisits(
      [
        { status: "CONFIRMED", startsAt: "2026-10-14T09:00:00Z" },
        { status: "REQUESTED", startsAt: "2026-10-23T13:30:00Z" },
        { status: "COMPLETED", startsAt: "2026-10-12T10:00:00Z" },
        { status: "CANCELLED", startsAt: "2026-10-13T10:00:00Z" },
      ],
      now,
    );
    expect(groups.waiting.map((visit) => visit.startsAt)).toEqual(["2026-10-23T13:30:00Z"]);
    expect(groups.passed.map((visit) => visit.startsAt)).toEqual(["2026-10-14T09:00:00Z"]);
    expect(groups.completed).toHaveLength(1);
    expect(groups.cancelled).toHaveLength(1);
  });
});
