import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { EnvelopeInterceptor } from "./common/envelope.interceptor";
import { HttpExceptionFilter } from "./common/http.filter";
import { validateRuntimeEnvironment } from "./infrastructure/runtime-environment";

async function bootstrap(): Promise<void> {
  validateRuntimeEnvironment();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.WEB_URL ?? "http://localhost:3000",
    credentials: true,
  });
  app.setGlobalPrefix("api/v1", { exclude: ["health"] });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new EnvelopeInterceptor());
  const port = Number(process.env.API_PORT ?? 4000);
  await app.listen(port);
  Logger.log(`API is listening on http://localhost:${port}`, "Bootstrap");
}

void bootstrap();
