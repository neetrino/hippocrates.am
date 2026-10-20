import { PlatformRulesForm, type PlatformRules } from "@/features/portal/platform-rules-form";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { getTranslations } from "next-intl/server";
import { sessionGet } from "@/shared/session-api";

const fallback: PlatformRules = {
  patientRegistrationEnabled: true,
  bookingEnabled: true,
  maxBookingDays: 60,
  minNoticeMinutes: 120,
  cancelDeadlineMinutes: 1440,
  rescheduleDeadlineMinutes: 1440,
};

export default async function PlatformRulesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  await requireSuperAdmin();
  const t = await getTranslations("platformRules");
  const rules = (await sessionGet<PlatformRules>("/platform/settings")) ?? fallback;
  return (
    <AdminPortalShell title={t("title")} eyebrow={t("title")}>
      <PlatformRulesForm initial={rules} />
    </AdminPortalShell>
  );
}
