import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { QuestionCard } from "@/shared/public-types";
import { EmptyState } from "@/shared/ui/empty-state";

export default async function PortalQuestionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  prepareLocale(locale);
  await requireSuperAdmin();
  const t = await getTranslations("questions");
  const common = await getTranslations("common");
  const questions = await publicGet<QuestionCard[]>("/questions");

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={t("title")}>
      <div className="grid gap-4">
        <p className="m-0 max-w-[42rem] text-lg leading-relaxed text-muted">{t("lede")}</p>
        {questions.length === 0 ? <EmptyState>{t("empty")}</EmptyState> : null}
        <div className="grid gap-3">
          {questions.map((question) => (
            <article
              className="grid gap-3.5 rounded-[1.4rem] border border-line bg-white p-5 shadow-soft"
              key={question.id}
            >
              <p className="m-0 inline-flex w-fit items-center rounded-full bg-accent-soft px-2.5 py-1 text-[0.82rem] font-semibold text-accent">
                {question.category}
              </p>
              <h2>{question.title}</h2>
              <p className="m-0">{question.body}</p>
              {question.answers.map((answer) => (
                <p className="m-0" key={answer.id}>
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
    </AdminPortalShell>
  );
}
