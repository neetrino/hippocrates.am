import { nextMailAttempt } from "./notice-mail-attempt";

describe("nextMailAttempt", () => {
  it("keeps a rejected letter pending until the fifth failure", () => {
    expect(nextMailAttempt(true, 2)).toEqual({ status: "SENT", attempts: 2 });
    expect(nextMailAttempt(false, 3)).toEqual({ status: "PENDING", attempts: 4 });
    expect(nextMailAttempt(false, 4)).toEqual({ status: "FAILED", attempts: 5 });
  });
});
