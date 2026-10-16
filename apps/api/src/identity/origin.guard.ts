import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import type { AppRequest } from "../types/http";
import { assertTrustedOrigin } from "./origin-policy";

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
