const variableName = process.argv[2];
const raw = variableName ? process.env[variableName]?.trim() : "";

if (!variableName || !raw) {
  throw new Error(`${variableName || "Database URL"} is required`);
}

let url;
try {
  url = new URL(raw);
} catch {
  throw new Error(`${variableName} must be a valid PostgreSQL URL`);
}

const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);
const validProtocol = url.protocol === "postgresql:" || url.protocol === "postgres:";
if (!validProtocol || !localHosts.has(url.hostname.toLowerCase())) {
  throw new Error(`${variableName} must target a local database for this developer command`);
}

const databaseName = decodeURIComponent(url.pathname.replace(/^\//, "")).toLowerCase();
if (!databaseName || databaseName === "postgres" || databaseName.startsWith("template")) {
  throw new Error(`${variableName} must target a named application database`);
}
