import { DATABASE_IDLE_MS } from "./database-pool";
import { shouldReleaseDatabase } from "./database-idle";

describe("shouldReleaseDatabase", () => {
  it("releases only after the site was used and then left idle for 5 minutes", () => {
    expect(shouldReleaseDatabase({ used: false, announced: false, idleForMs: DATABASE_IDLE_MS })).toBe(false);
    expect(shouldReleaseDatabase({ used: true, announced: false, idleForMs: DATABASE_IDLE_MS - 1 })).toBe(false);
    expect(shouldReleaseDatabase({ used: true, announced: false, idleForMs: DATABASE_IDLE_MS })).toBe(true);
    expect(shouldReleaseDatabase({ used: true, announced: true, idleForMs: DATABASE_IDLE_MS })).toBe(false);
  });
});
