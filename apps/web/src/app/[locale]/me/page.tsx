import { getLocale, getTranslations } from "next-intl/server";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { LogoutButton } from "@/features/portal/logout-button";
import { AnswerForm, AskQuestionForm } from "@/features/portal/question-forms";
import { ReviewForm } from "@/features/portal/review-form";
import { SuperAdminHome } from "@/features/portal/super-admin-home";
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
      <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
        <p>
          {t("signIn")} <Link href="/login">{nav("login")}</Link>
        </p>
      </div>
    );
  }

  const appointments = (await sessionGet<AppointmentCard[]>("/appointments/mine")) ?? [];
  const notices = (await sessionGet<Notice[]>("/me/notifications")) ?? [];

  if (me.role === "SUPER_ADMIN") {
    return <SuperAdminHome me={me} appointments={appointments} notices={notices} />;
  }

  const role = asRole(me.role);
  const questions = me.role === "DOCTOR" ? await publicGet<QuestionCard[]>("/questions") : [];
  const btn =
    "inline-flex w-fit cursor-pointer items-center justify-center rounded-full border-0 bg-accent px-[18px] py-3 font-semibold text-white transition-[background,box-shadow] duration-160 hover:bg-accent-hover hover:shadow-accent";
  return (
    <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-3.5 pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
      <div className="flex items-end justify-between gap-3 max-md:items-center">
        <div>
          <p className="mb-3 text-[0.78rem] font-semibold tracking-[0.08em] text-accent uppercase">
            {role ? common(role) : me.role}
          </p>
          <h1>{me.displayName}</h1>
        </div>
        <LogoutButton />
      </div>
      {me.role === "ADMIN" ? (
        <Link className={btn} href="/clinic">
          {t("openClinic")}
        </Link>
      ) : null}
      <section className="grid gap-[18px] pt-7">
        <h2>{t("visits")}</h2>
        <div className="grid gap-3">
          {appointments.map((item) => {
            const status = asVisitStatus(item.status);
            return (
              <article className="grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" key={item.id}>
                <strong>{item.offering.name}</strong>
                <p className="m-0 text-muted">
                  {me.role === "DOCTOR"
                    ? item.patient.displayName
                    : `${item.clinic.name} · ${item.doctor.user.displayName}`}
                </p>
                <p>
                  {formatWhen(item.startsAt, locale)} · {status ? common(status) : item.status} ·{" "}
                  {common("price", { amount: formatAmount(item.priceAmd) })}
                </p>
                {me.role === "PATIENT" ? <AppointmentActions id={item.id} status={item.status} mode="patient" /> : null}
                {me.role === "PATIENT" && item.status === "COMPLETED" && !item.review ? (
                  <ReviewForm appointmentId={item.id} />
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
      <section className="grid gap-[18px] pt-7">
        <h2>{t("notices")}</h2>
        {notices.length === 0 ? <p className="m-0 text-muted">{t("noNotices")}</p> : null}
        {notices.map((notice) => (
          <p
            className="flex items-center justify-between gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5"
            key={notice.id}
          >
            {notice.body}
          </p>
        ))}
      </section>
      {me.role === "PATIENT" ? <AskQuestionForm /> : null}
      {me.role === "DOCTOR" ? (
        <section className="grid gap-3.5 pt-7">
          <h2>{questionsCopy("public")}</h2>
          {questions.map((question) => (
            <article className="grid gap-3.5 rounded-card border border-line bg-white p-5 shadow-soft" key={question.id}>
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
