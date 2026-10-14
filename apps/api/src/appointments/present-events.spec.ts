import { omitEvents, presentEvent } from "./present-events";

const created = {
  id: "e1",
  type: "CREATED",
  actorRole: "PATIENT",
  actorUserId: "u1",
  reason: null,
  fromStartsAt: null,
  toStartsAt: null,
  createdAt: new Date("2026-10-14T07:02:00.000Z"),
};

describe("present events", () => {
  it("replaces the actor id with a display name", () => {
    expect(presentEvent(created, new Map([["u1", "Արամ"]]))).toEqual({
      id: "e1",
      type: "CREATED",
      actorRole: "PATIENT",
      actorName: "Արամ",
      reason: null,
      fromStartsAt: null,
      toStartsAt: null,
      createdAt: created.createdAt,
    });
  });

  it("keeps a system row without a name", () => {
    expect(presentEvent({ ...created, actorUserId: null, actorRole: "SYSTEM" }, new Map()).actorName).toBeNull();
  });

  it("drops stored events before the card is sent", () => {
    expect(omitEvents({ id: "a1", events: [created] })).toEqual({ id: "a1" });
  });
});
