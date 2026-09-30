import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { finalize, Observable } from "rxjs";
import type { Response } from "express";
import { DatabaseIdleService } from "../infrastructure/database-idle.service";
import type { AppRequest } from "../types/http";

@Injectable()
export class RequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  constructor(private readonly databaseIdle: DatabaseIdleService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle();
    this.databaseIdle.touch();
    const started = Date.now();
    const request = context.switchToHttp().getRequest<AppRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      finalize(() => {
        const path = request.originalUrl ?? request.url;
        this.logger.log(`${request.method} ${path} ${response.statusCode} ${Date.now() - started}ms`);
      }),
    );
  }
}
