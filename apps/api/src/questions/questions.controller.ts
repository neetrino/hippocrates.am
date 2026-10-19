import { Controller, Get, Post } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { Public, Roles } from "../identity/auth.decorators";

@Controller("questions")
export class QuestionsController {
  @Post()
  @Roles("PATIENT")
  create(): never {
    throw closedSection();
  }

  @Public()
  @Get()
  published(): never[] {
    return [];
  }

  @Post(":id/publish")
  @Roles("SUPER_ADMIN")
  publish(): never {
    throw closedSection();
  }

  @Post(":id/answers")
  @Roles("DOCTOR")
  answer(): never {
    throw closedSection();
  }
}

function closedSection(): AppError {
  return new AppError("FORBIDDEN", 403, "Հարցերը V1-ում փակ են");
}
