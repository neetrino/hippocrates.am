import { getLocale, getTranslations } from "next-intl/server";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { LogoutButton } from "@/features/portal/logout-button";
import { AnswerForm, AskQuestionForm } from "@/features/portal/question-forms";
import { ReviewForm } from "@/features/portal/review-form";
import { Link } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { asRole, asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import { publicGet } from "@/shared/public-api";
import type { AppointmentCard, Me, QuestionCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

type Notice = { id: string; body: string; createdAt: string };

export default async function MePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
  const questionsCopy = await getTranslations("questions");
  const me = await sessionGet<Me>("/auth/me");
  if (!me) {
    return (
      <div className="shell section">
        <p>{t("signIn")} <Link href="/login">{nav("login")}</Link></p>
      </div>
    );
  }
  const role = asRole(me.role);
  const appointments = await sessionGet<AppointmentCard[]>("/appointments/mine");
  const notices = await sessionGet<Notice[]>("/me/notifications");
  const questions = me.role === "DOCTOR" ? await publicGet<QuestionCard[]>("/questions") : [];
  return (
    <div className="shell section stack">
      <div className="section-head">
        <div>
          <p className="eyebrow">{role ? common(role) : me.role}</p>
          <h1>{me.displayName}</h1>
        </div>
        <LogoutButton />
      </div>
      {me.role === "SUPER_ADMIN" ? <Link className="btn" href="/platform">{t("openPlatform")}</Link> : null}
      {me.role === "ADMIN" ? <Link className="btn" href="/clinic">{t("openClinic")}</Link> : null}
      <section className="section">
        <h2>{t("visits")}</h2>
        <div className="list">
          {(appointments ?? []).map((item) => {
            const status = asVisitStatus(item.status);
            return (
              <article className="panel" key={item.id}>
                <strong>{item.offering.name}</strong>
                <p className="muted">{me.role === "DOCTOR" ? item.patient.displayName : `${item.clinic.name} · ${item.doctor.user.displayName}`}</p>
                <p>{formatWhen(item.startsAt, locale)} · {status ? common(status) : item.status} · {common("price", { amount: formatAmount(item.priceAmd) })}</p>
                {me.role === "PATIENT" ? <AppointmentActions id={item.id} status={item.status} mode="patient" /> : null}
                {me.role === "PATIENT" && item.status === "COMPLETED" && !item.review ? <ReviewForm appointmentId={item.id} /> : null}
              </article>
            );
          })}
        </div>
      </section>
      <section className="section">
        <h2>{t("notices")}</h2>
        {(notices ?? []).length === 0 ? <p className="muted">{t("noNotices")}</p> : null}
        {(notices ?? []).map((notice) => <p className="row" key={notice.id}>{notice.body}</p>)}
      </section>
      {me.role === "PATIENT" ? <AskQuestionForm /> : null}
      {me.role === "DOCTOR" ? (
        <section className="section stack">
          <h2>{questionsCopy("public")}</h2>
          {questions.map((question) => (
            <article className="panel" key={question.id}>
              <h3>{question.title}</h3>
              <p>{question.body}</p>
              <AnswerForm questionId={question.id} />
            </article>
          ))}
        </section>
      ) : null}
    </div>
  );
}
