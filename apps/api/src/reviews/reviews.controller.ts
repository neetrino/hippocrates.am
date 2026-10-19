import { Controller, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { Roles } from "../identity/auth.decorators";

@Controller("reviews")
export class ReviewsController {
  @Post()
  @Roles("PATIENT")
  create(): never {
    throw closedReviews();
  }

  @Post(":id/reply")
  @Roles("ADMIN")
  reply(): never {
    throw closedReviews();
  }
}

function closedReviews(): AppError {
  return new AppError("FORBIDDEN", 403, "Կարծիքները V1-ում փակ են");
}
