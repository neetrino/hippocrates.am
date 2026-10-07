import { getTranslations } from "next-intl/server";
import { AnswerForm } from "@/features/portal/question-forms";
import { publicGet } from "@/shared/public-api";
import type { QuestionCard } from "@/shared/public-types";

/** Published questions the signed-in doctor can answer. */
export async function DoctorAnswers() {
  const t = await getTranslations("questions");
  const questions = (await publicGet<QuestionCard[]>("/questions")) ?? [];
  if (questions.length === 0) {
    return <p className="m-0 rounded-[1.6rem] bg-white px-5 py-8 text-muted shadow-soft">{t("empty")}</p>;
  }

  return (
    <div className="grid gap-3">
      {questions.map((question) => (
        <article key={question.id} className="grid gap-3 rounded-[1.6rem] bg-white p-5 shadow-soft">
          <h2 className="m-0 text-lg">{question.title}</h2>
          <p className="m-0">{question.body}</p>
          <AnswerForm questionId={question.id} />
        </article>
      ))}
    </div>
  );
}
