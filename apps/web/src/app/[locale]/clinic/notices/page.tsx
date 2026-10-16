import { getLocale, getTranslations } from "next-intl/server";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { NoticeList, type NoticeRow } from "@/features/portal/notice-list";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { doctorDisplayName } from "@/shared/clinic-label";
import { formatWhen, patientLabel } from "@/shared/format";
import { type NoticeItem } from "@/shared/notice";
import { noticeKind, noticeLine, type NoticeMessageKey } from "@/shared/notice-text";
import { sessionGet } from "@/shared/session-api";
import { ListPagination, listPage } from "@/shared/ui/list-pagination";

export default async function ClinicNoticesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const locale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const page = listPage((await searchParams).page);
  await requireClinicAdmin();
  const notices = (
    (await sessionGet<NoticeItem[]>(`/me/notifications${page > 1 ? `?page=${page}` : ""}`)) ?? []
  );

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={t("notices")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        {notices.length === 0 ? (
          <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>
        ) : (
          <NoticeList rows={notices.map((notice) => toRow(notice, locale, t, t("noticeArrived")))} />
        )}
        <ListPagination page={page} itemCount={notices.length} />
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
  const visit = notice.appointment;
  const patient = visit ? patientLabel(visit) : "";
  const doctor = visit ? doctorDisplayName(visit.doctor, locale) : "";
  const context = visit ? `${patient} · ${doctor} · ${formatWhen(visit.startsAt, locale)}` : "";
  return {
    id: notice.id,
    text: noticeLine(notice.body, notice.detail, t),
    when: `${arrivedLabel} · ${formatWhen(notice.createdAt, locale)}`,
    context,
    unread: notice.readAt === null,
    startsAt: visit?.startsAt ?? null,
    kind: noticeKind(notice.body),
    people: [patient, doctor].filter(Boolean),
  };
}
