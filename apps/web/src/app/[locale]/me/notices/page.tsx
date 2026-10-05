import { getLocale, getTranslations } from "next-intl/server";
import { NoticeList, type NoticeRow } from "@/features/portal/notice-list";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { Link, redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { clinicDisplayName, doctorDisplayName } from "@/shared/clinic-label";
import { formatWhen } from "@/shared/format";
import { type NoticeItem } from "@/shared/notice";
import { noticeMessageKey } from "@/shared/notice-text";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PatientNoticesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const displayLocale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
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
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role !== "PATIENT") redirect({ href: "/me", locale });
  const notices = (await sessionGet<NoticeItem[]>("/me/notifications")) ?? [];

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("notices")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        {notices.length === 0 ? (
          <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>
        ) : (
          <NoticeList rows={notices.map((notice) => toRow(notice, displayLocale, t, t("noticeArrived")))} />
        )}
      </section>
    </PatientPortalShell>
  );
}

function toRow(
  notice: NoticeItem,
  locale: string,
  t: (key: "noticeRequested" | "noticeConfirmed" | "noticeCancelled" | "noticeRescheduled" | "noticeCompleted") => string,
  arrivedLabel: string,
): NoticeRow {
  const messageKey = noticeMessageKey(notice.body);
  const visit = notice.appointment;
  const context = visit
    ? `${clinicDisplayName(visit.clinic, locale)} · ${doctorDisplayName(visit.doctor, locale)} · ${formatWhen(visit.startsAt, locale)}`
    : "";
  return {
    id: notice.id,
    text: messageKey ? t(messageKey) : notice.body,
    when: `${arrivedLabel} · ${formatWhen(notice.createdAt, locale)}`,
    context,
    unread: notice.readAt === null,
  };
}
