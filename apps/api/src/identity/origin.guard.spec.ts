import { assertTrustedOrigin } from "./origin-policy";

describe("OriginGuard", () => {
  const webUrl = "http://localhost:3000";

  it("allows safe methods without an Origin header", () => {
    expect(() => assertTrustedOrigin("GET", undefined, webUrl)).not.toThrow();
  });

  it("allows a matching origin on state-changing requests", () => {
    expect(() => assertTrustedOrigin("POST", "http://localhost:3000", webUrl)).not.toThrow();
  });

  it("rejects a missing origin on state-changing requests", () => {
    expect(() => assertTrustedOrigin("PATCH", undefined, webUrl)).toThrow(
      expect.objectContaining({ code: "ORIGIN_REJECTED", status: 403 }),
    );
  });

  it("rejects a different origin", () => {
    expect(() => assertTrustedOrigin("DELETE", "https://example.test", webUrl)).toThrow(
      expect.objectContaining({ code: "ORIGIN_REJECTED", status: 403 }),
    );
  });
});
