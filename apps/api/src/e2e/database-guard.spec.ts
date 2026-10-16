import { assertE2eDatabase, type E2eEnv } from "./database-guard";

const allowed: E2eEnv = {
  E2E_DATABASE: "loopback",
  DATABASE_URL: "postgresql://hippocrates:hippocrates@127.0.0.1:5432/hippocrates",
  DIRECT_URL: "postgresql://hippocrates:hippocrates@127.0.0.1:5432/hippocrates",
  SESSION_SECRET: "ci-e2e-session-secret-at-least-32-chars",
  SEED_PASSWORD: "Ci-E2e-Only-2026",
};

describe("assertE2eDatabase", () => {
  it("accepts localhost and ipv6 loopback", () => {
    expect(() => assertE2eDatabase(allowed)).not.toThrow();
    expect(() =>
      assertE2eDatabase({
        ...allowed,
        DATABASE_URL: "postgresql://hippocrates:hippocrates@localhost:5432/hippocrates",
        DIRECT_URL: "postgresql://hippocrates:hippocrates@[::1]:5432/hippocrates",
      }),
    ).not.toThrow();
  });

  it("refuses a missing flag, a hosted host, and a short secret", () => {
    expect(() => assertE2eDatabase({ ...allowed, E2E_DATABASE: "" })).toThrow(/loopback/);
    expect(() =>
      assertE2eDatabase({
        ...allowed,
        DATABASE_URL: "postgresql://user:secret@ep-example.neon.tech/hippocrates",
      }),
    ).toThrow(/DATABASE_URL host ep-example.neon.tech is not loopback/);
    expect(() =>
      assertE2eDatabase({
        ...allowed,
        DIRECT_URL: "postgresql://user:secret@ep-example-pooler.neon.tech/hippocrates",
      }),
    ).toThrow(/DIRECT_URL host ep-example-pooler.neon.tech is not loopback/);
    expect(() => assertE2eDatabase({ ...allowed, SESSION_SECRET: "short" })).toThrow(/SESSION_SECRET/);
    expect(() => assertE2eDatabase({ ...allowed, SEED_PASSWORD: "short" })).toThrow(/SEED_PASSWORD/);
  });
});
