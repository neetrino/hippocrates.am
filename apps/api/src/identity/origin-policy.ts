import { AppError } from "../common/app-error";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function assertTrustedOrigin(
  method: string,
  requestOrigin: string | undefined,
  allowedWebUrl: string,
): void {
  if (safeMethods.has(method.toUpperCase())) return;
  const allowedOrigin = parseOrigin(allowedWebUrl, "WEB_URL");
  if (!requestOrigin || parseOrigin(requestOrigin, "Origin") !== allowedOrigin) {
    throw new AppError("ORIGIN_REJECTED", 403, "Հարցման աղբյուրը թույլատրված չէ");
  }
}

function parseOrigin(value: string, label: string): string {
  try {
    return new URL(value).origin;
  } catch {
    throw new AppError("CONFIG", 500, `${label} is invalid`);
  }
}
