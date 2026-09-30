import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { QuestionCard } from "@/shared/public-types";
import { EmptyState } from "@/shared/ui/empty-state";

export default async function QuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("questions");
  const questions = await publicGet<QuestionCard[]>("/questions");
  return (
    <div className="shell section">
      <h1>{t("title")}</h1>
      <p className="lede">{t("lede")}</p>
      {questions.length === 0 ? <EmptyState>{t("empty")}</EmptyState> : null}
      <div className="list">
        {questions.map((question) => (
          <article className="panel" key={question.id}>
            <p className="badge">{question.category}</p>
            <h2>{question.title}</h2>
            <p>{question.body}</p>
            {question.answers.map((answer) => (
              <p key={answer.id}>
                <strong>{answer.doctor.user.displayName}</strong>
                <span className="muted"> · {answer.doctor.specialty}</span>
                <br />
                {answer.body}
              </p>
            ))}
          </article>
        ))}
      </div>
    </div>
  );
}
