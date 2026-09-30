import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { AppError } from "../common/app-error";
import { recordOf, requiredString } from "../common/input";
import { PrismaService } from "../infrastructure/prisma.service";
import { requireRoles, type Actor } from "../identity/access";
import { Public, Roles } from "../identity/auth.decorators";
import { CurrentActor } from "../identity/current-actor";

@Controller("questions")
export class QuestionsController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @Roles("PATIENT")
  async create(@CurrentActor() actor: Actor, @Body() body: unknown): Promise<{ id: string }> {
    requireRoles(actor, ["PATIENT"]);
    const input = recordOf(body);
    const question = await this.prisma.question.create({
      data: {
        authorId: actor.id,
        title: requiredString(input.title, "Վերնագիր"),
        body: requiredString(input.body, "Հարց"),
        category: typeof input.category === "string" ? input.category.trim() : "Ընդհանուր",
        status: "PENDING",
      },
    });
    return { id: question.id };
  }

  @Public()
  @Get()
  async published(@Query("category") category?: string) {
    return this.prisma.question.findMany({
      where: {
        status: "PUBLISHED",
        category: category ? category : undefined,
        answers: { some: { published: true } },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        createdAt: true,
        answers: {
          where: { published: true },
          select: {
            id: true,
            body: true,
            doctor: { select: { id: true, specialty: true, user: { select: { displayName: true } } } },
          },
        },
      },
    });
  }

  @Post(":id/publish")
  @Roles("SUPER_ADMIN")
  async publish(@Param("id") id: string): Promise<{ id: string }> {
    const question = await this.prisma.question.update({ where: { id }, data: { status: "PUBLISHED" } }).catch(() => null);
    if (!question) throw new AppError("NOT_FOUND", 404, "Հարցը չի գտնվել");
    return { id: question.id };
  }

  @Post(":id/answers")
  @Roles("DOCTOR")
  async answer(@CurrentActor() actor: Actor, @Param("id") id: string, @Body() body: unknown): Promise<{ id: string }> {
    const doctor = await this.prisma.doctorProfile.findUnique({ where: { userId: actor.id } });
    if (!doctor?.published) throw new AppError("FORBIDDEN", 403, "Բժիշկը հաստատված չէ");
    const question = await this.prisma.question.findFirst({ where: { id, status: "PUBLISHED" } });
    if (!question) throw new AppError("NOT_FOUND", 404, "Հարցը չի գտնվել");
    const answer = await this.prisma.answer.create({
      data: { questionId: id, doctorId: doctor.id, body: requiredString(recordOf(body).body, "Պատասխան"), published: true },
    });
    return { id: answer.id };
  }
}
