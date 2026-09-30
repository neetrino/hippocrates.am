import "reflect-metadata";
import "./types/express";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { EnvelopeInterceptor } from "./common/envelope.interceptor";
import { HttpExceptionFilter } from "./common/http.filter";

async function bootstrap(): Promise<void> {
  if ((process.env.SESSION_SECRET ?? "").length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
  });
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new EnvelopeInterceptor());
  await app.listen(Number(process.env.API_PORT ?? 4000));
}

void bootstrap();
