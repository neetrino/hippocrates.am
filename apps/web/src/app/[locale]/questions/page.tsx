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
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <h1>{t("title")}</h1>
      <p className="m-0 max-w-[42rem] text-lg leading-relaxed text-muted">{t("lede")}</p>
      {questions.length === 0 ? <EmptyState>{t("empty")}</EmptyState> : null}
      <div className="grid gap-3">
        {questions.map((question) => (
          <article className="grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" key={question.id}>
            <p className="m-0 inline-flex w-fit items-center rounded-full bg-accent-soft px-2.5 py-1 text-[0.82rem] font-semibold text-accent">
              {question.category}
            </p>
            <h2>{question.title}</h2>
            <p>{question.body}</p>
            {question.answers.map((answer) => (
              <p key={answer.id}>
                <strong>{answer.doctor.user.displayName}</strong>
                <span className="text-muted"> · {answer.doctor.specialty}</span>
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
