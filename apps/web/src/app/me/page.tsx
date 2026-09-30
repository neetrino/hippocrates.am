import Link from "next/link";
import { AppointmentActions } from "@/features/portal/appointment-actions";
import { LogoutButton } from "@/features/portal/logout-button";
import { AnswerForm, AskQuestionForm } from "@/features/portal/question-forms";
import { ReviewForm } from "@/features/portal/review-form";
import { formatAmd, formatWhen, statusLabel } from "@/shared/format";
import { publicGet } from "@/shared/public-api";
import type { AppointmentCard, Me, QuestionCard } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

const roleLabel: Record<string, string> = {
  PATIENT: "Պացիենտ",
  DOCTOR: "Բժիշկ",
  ADMIN: "Կլինիկայի ադմին",
  SUPER_ADMIN: "Հարթակի ադմին",
};

type Notice = { id: string; body: string; createdAt: string };

export default async function MePage() {
  const me = await sessionGet<Me>("/auth/me");
  if (!me) return <div className="shell section"><p>Մուտք գործեք՝ ձեր էջը տեսնելու համար։ <Link href="/login">Մուտք</Link></p></div>;
  const appointments = await sessionGet<AppointmentCard[]>("/appointments/mine");
  const notices = await sessionGet<Notice[]>("/me/notifications");
  const questions = me.role === "DOCTOR" ? await publicGet<QuestionCard[]>("/questions") : [];
  return (
    <div className="shell section stack">
      <div className="section-head">
        <div>
          <p className="eyebrow">{roleLabel[me.role] ?? me.role}</p>
          <h1>{me.displayName}</h1>
        </div>
        <LogoutButton />
      </div>
      {me.role === "SUPER_ADMIN" ? <Link className="btn" href="/platform">Գրանցել կլինիկա</Link> : null}
      {me.role === "ADMIN" ? <Link className="btn" href="/clinic">Կլինիկայի վահանակ</Link> : null}
      <section className="section">
        <h2>Այցեր</h2>
        <div className="list">
          {(appointments ?? []).map((item) => (
            <article className="panel" key={item.id}>
              <strong>{item.offering.name}</strong>
              <p className="muted">{me.role === "DOCTOR" ? item.patient.displayName : `${item.clinic.name} · ${item.doctor.user.displayName}`}</p>
              <p>{formatWhen(item.startsAt)} · {statusLabel(item.status)} · {formatAmd(item.priceAmd)}</p>
              {me.role === "PATIENT" ? <AppointmentActions id={item.id} status={item.status} mode="patient" /> : null}
              {me.role === "PATIENT" && item.status === "COMPLETED" && !item.review ? <ReviewForm appointmentId={item.id} /> : null}
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <h2>Ծանուցումներ</h2>
        {(notices ?? []).length === 0 ? <p className="muted">Ծանուցում չկա։</p> : null}
        {(notices ?? []).map((notice) => <p className="row" key={notice.id}>{notice.body}</p>)}
      </section>
      {me.role === "PATIENT" ? <AskQuestionForm /> : null}
      {me.role === "DOCTOR" ? (
        <section className="section stack">
          <h2>Հանրային հարցեր</h2>
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
