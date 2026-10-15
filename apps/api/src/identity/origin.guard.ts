import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AppError } from "../common/app-error";
import type { AppRequest } from "../types/http";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

@Injectable()
export class OriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AppRequest>();
    assertTrustedOrigin(
      request.method,
      request.get("origin"),
      process.env.WEB_URL ?? "http://localhost:3000",
    );
    return true;
  }
}

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
