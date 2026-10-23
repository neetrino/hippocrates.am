import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ClinicOverviewView, type ClinicOverview } from "@/features/portal/clinic-overview-view";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { shownClinicCopy } from "@/shared/clinic-label";
import { sessionGet } from "@/shared/session-api";

export default async function SuperAdminClinicPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  prepareLocale(locale);
  const displayLocale = await getLocale();
  await requireSuperAdmin();
  const clinic = await sessionGet<ClinicOverview>(`/clinics/${id}/overview`);
  if (!clinic) notFound();
  const common = await getTranslations("common");
  const title = shownClinicCopy(clinic.copies, displayLocale).name || common("notFoundTitle");

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={title}>
      <ClinicOverviewView clinic={clinic} />
    </AdminPortalShell>
  );
}
