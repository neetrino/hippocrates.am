import { SuperAdminHome, type PlatformSummary } from "@/features/portal/super-admin-home";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";

const emptySummary: PlatformSummary = { clinics: 0, pendingQuestions: 0, publishedDoctors: 0 };

export default async function SuperAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const me = await requireSuperAdmin();
  const summary = (await sessionGet<PlatformSummary>("/platform/summary")) ?? emptySummary;
  return <SuperAdminHome me={me} summary={summary} />;
}
