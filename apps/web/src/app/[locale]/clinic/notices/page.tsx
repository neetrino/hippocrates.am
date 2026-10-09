import { getLocale, getTranslations } from "next-intl/server";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { NoticeList, type NoticeRow } from "@/features/portal/notice-list";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { doctorDisplayName } from "@/shared/clinic-label";
import { formatWhen } from "@/shared/format";
import { type NoticeItem } from "@/shared/notice";
import { noticeMessageKey, type NoticeMessageKey } from "@/shared/notice-text";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicNoticesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  await requireClinicAdmin();
  const notices = (await sessionGet<NoticeItem[]>("/me/notifications")) ?? [];

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={t("notices")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        {notices.length === 0 ? (
          <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>
        ) : (
          <NoticeList rows={notices.map((notice) => toRow(notice, locale, t, t("noticeArrived")))} />
        )}
      </section>
    </ClinicManagerShell>
  );
}

function toRow(
  notice: NoticeItem,
  locale: string,
  t: (key: NoticeMessageKey) => string,
  arrivedLabel: string,
): NoticeRow {
  const messageKey = noticeMessageKey(notice.body);
  const visit = notice.appointment;
  const context = visit
    ? `${visit.patient.displayName} · ${doctorDisplayName(visit.doctor, locale)} · ${formatWhen(visit.startsAt, locale)}`
    : "";
  return {
    id: notice.id,
    text: messageKey ? t(messageKey) : notice.body,
    when: `${arrivedLabel} · ${formatWhen(notice.createdAt, locale)}`,
    context,
    unread: notice.readAt === null,
  };
}
