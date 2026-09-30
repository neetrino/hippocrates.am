import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppointmentsController } from "./appointments/appointments.controller";
import { CatalogController } from "./catalog/catalog.controller";
import { ClinicsController } from "./clinics/clinics.controller";
import { RequestIdMiddleware } from "./common/request-id.middleware";
import { DoctorsController } from "./doctors/doctors.controller";
import { HealthController } from "./health.controller";
import { AuthController } from "./identity/auth.controller";
import { AuthGuard } from "./identity/auth.guard";
import { RateLimitService } from "./identity/rate-limit.service";
import { SessionService } from "./identity/session.service";
import { PrismaModule } from "./infrastructure/prisma.module";
import { MarketplaceController } from "./marketplace/marketplace.controller";
import { NotificationsService } from "./notifications/notifications.service";
import { OperationsController } from "./operations/operations.controller";
import { QuestionsController } from "./questions/questions.controller";
import { ReviewsController } from "./reviews/reviews.controller";
import { SchedulingController } from "./scheduling/scheduling.controller";

@Module({
  imports: [PrismaModule],
  controllers: [
    HealthController,
    AuthController,
    ClinicsController,
    DoctorsController,
    CatalogController,
    SchedulingController,
    AppointmentsController,
    MarketplaceController,
    QuestionsController,
    ReviewsController,
    OperationsController,
  ],
  providers: [
    SessionService,
    RateLimitService,
    NotificationsService,
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
