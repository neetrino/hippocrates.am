import { isolatedTestDatabaseUrl } from "./test-database-url";

describe("isolatedTestDatabaseUrl", () => {
  it("accepts a named local test database", () => {
    const url = "postgresql://user:password@127.0.0.1:5432/hippocrates_test";
    expect(isolatedTestDatabaseUrl(url)).toBe(url);
  });

  it("skips when no test database is configured", () => {
    expect(isolatedTestDatabaseUrl("")).toBe("");
  });

  it.each([
    "postgresql://user:password@db.example.com:5432/hippocrates_test",
    "postgresql://user:password@localhost:5432/hippocrates",
    "https://localhost/hippocrates_test",
    "not-a-url",
  ])("rejects an unsafe target: %s", (url) => {
    expect(() => isolatedTestDatabaseUrl(url)).toThrow();
  });
});
