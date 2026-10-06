import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { QuestionCard } from "@/shared/public-types";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageStack } from "@/shared/ui/page-frame";

export default async function QuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("questions");
  const questions = await publicGet<QuestionCard[]>("/questions");
  return (
    <PageStack>
      <div className="grid max-w-[40rem] gap-3">
        <h1>{t("title")}</h1>
        <p className="m-0 text-[1.05rem] leading-relaxed text-muted">{t("lede")}</p>
      </div>
      {questions.length === 0 ? <EmptyState>{t("empty")}</EmptyState> : null}
      <div className="grid gap-3">
        {questions.map((question) => (
          <article className="grid gap-3 rounded-card bg-surface px-6 py-6 max-md:px-5 max-md:py-5" key={question.id}>
            <p className="kicker">{question.category}</p>
            <h2 className="text-[1.35rem]">{question.title}</h2>
            <p className="m-0 leading-relaxed">{question.body}</p>
            {question.answers.map((answer) => (
              <p key={answer.id} className="m-0 border-t border-line pt-4">
                <strong>{answer.doctor.user.displayName}</strong>
                <span className="text-muted"> · {answer.doctor.specialty}</span>
                <br />
                {answer.body}
              </p>
            ))}
          </article>
        ))}
      </div>
    </PageStack>
  );
}
