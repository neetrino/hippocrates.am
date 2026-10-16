import { getTranslations } from "next-intl/server";
import { ClinicManagerShell } from "@/features/portal/clinic-manager-shell";
import { NoticeList } from "@/features/portal/notice-list";
import { requireClinicAdmin } from "@/features/portal/require-clinic-admin";
import { prepareLocale } from "@/i18n/locale";
import { emptyNoticePage, noticePageLimit, type NoticePage } from "@/shared/notice";
import { sessionGet } from "@/shared/session-api";

export default async function ClinicNoticesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  prepareLocale(raw);
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  await requireClinicAdmin();
  const page = (await sessionGet<NoticePage>(`/me/notifications?limit=${noticePageLimit}`)) ?? emptyNoticePage;

  return (
    <ClinicManagerShell eyebrow={common("ADMIN")} title={t("notices")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        <NoticeList page={page} audience="clinic" />
      </section>
    </ClinicManagerShell>
  );
}
