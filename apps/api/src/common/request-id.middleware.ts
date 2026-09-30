import { Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import type { NextFunction, Response } from "express";
import type { AppRequest } from "../types/http";

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: AppRequest, response: Response, next: NextFunction): void {
    const requestId = randomUUID();
    request.requestId = requestId;
    response.setHeader("x-request-id", requestId);
    next();
  }
}
