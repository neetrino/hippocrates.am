import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { AppRequest } from "../types/http";
import { map, Observable } from "rxjs";

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<AppRequest>();
    return next.handle().pipe(
      map((data: unknown) => ({ data, meta: { requestId: request.requestId ?? "unknown" } })),
    );
  }
}
