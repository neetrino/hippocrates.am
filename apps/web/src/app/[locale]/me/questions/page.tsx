import { getTranslations } from "next-intl/server";
import { DoctorAnswers } from "@/features/portal/doctor-answers";
import { DoctorPortalShell } from "@/features/portal/doctor-portal-shell";
import { PatientSignIn } from "@/features/portal/patient-account";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { AskQuestionForm } from "@/features/portal/question-forms";
import { redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function QuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("nav");
  const common = await getTranslations("common");
  const me = await sessionGet<Me>("/auth/me");
  if (!me) return <PatientSignIn />;
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role === "DOCTOR") {
    return (
      <DoctorPortalShell eyebrow="" title={t("questions")}>
        <DoctorAnswers />
      </DoctorPortalShell>
    );
  }
  if (me.role !== "PATIENT") redirect({ href: "/me", locale });

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("questions")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        <AskQuestionForm />
      </section>
    </PatientPortalShell>
  );
}
