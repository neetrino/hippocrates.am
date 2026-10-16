import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Response } from "express";
import type { AppRequest } from "../types/http";
import { AppError } from "./app-error";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<AppRequest>();
    const requestId = request.requestId ?? "unknown";
    if (exception instanceof AppError) {
      response.status(exception.status).json({
        error: { code: exception.code, message: exception.message },
        requestId,
      });
      return;
    }
    if (exception instanceof HttpException) {
      response.status(exception.getStatus()).json({
        error: { code: "HTTP_ERROR", message: "Հարցումը չհաջողվեց" },
        requestId,
      });
      return;
    }
    Logger.error(JSON.stringify({
      requestId,
      method: request.method,
      path: request.path,
      errorType: exception instanceof Error ? exception.name : "UnknownError",
    }), "Http");
    response.status(500).json({
      error: { code: "INTERNAL", message: "Ներքին սխալ" },
      requestId,
    });
  }
}
