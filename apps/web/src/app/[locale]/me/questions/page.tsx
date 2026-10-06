import { getTranslations } from "next-intl/server";
import { loadPatientAccount, PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { AskQuestionForm } from "@/features/portal/question-forms";
import { prepareLocale } from "@/i18n/locale";

export default async function PatientQuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("nav");
  const common = await getTranslations("common");
  if (!(await loadPatientAccount(locale))) return <PatientSignIn />;

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("questions")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        <AskQuestionForm />
      </section>
    </PatientPortalShell>
  );
}
