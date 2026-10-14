import { decisionOf, decisionPatch, kindOf } from "./verification";

describe("verification decisions", () => {
  it("approves into a live listing", () => {
    expect(decisionPatch("APPROVE")).toEqual({ verificationStatus: "APPROVED", published: true });
  });

  it("rejects and suspends off the marketplace", () => {
    expect(decisionPatch("REJECT")).toEqual({ verificationStatus: "REJECTED", published: false });
    expect(decisionPatch("SUSPEND")).toEqual({ verificationStatus: "SUSPENDED", published: false });
  });

  it("reads a decision and kind", () => {
    expect(decisionOf({ decision: "APPROVE" })).toBe("APPROVE");
    expect(kindOf("doctor")).toBe("doctor");
  });
});
