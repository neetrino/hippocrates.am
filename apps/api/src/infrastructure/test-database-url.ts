const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/** Returns an isolated local test URL or rejects before any fixture write. */
export function isolatedTestDatabaseUrl(raw = process.env.TEST_DATABASE_URL): string {
  const value = raw?.trim() ?? "";
  if (!value) return "";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("TEST_DATABASE_URL must be a valid PostgreSQL URL");
  }
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, "")).toLowerCase();
  const validProtocol = url.protocol === "postgresql:" || url.protocol === "postgres:";
  if (!validProtocol || !localHosts.has(url.hostname.toLowerCase()) || !databaseName.includes("test")) {
    throw new Error("TEST_DATABASE_URL must name an isolated local PostgreSQL test database");
  }
  return value;
}
