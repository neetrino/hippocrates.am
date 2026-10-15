import { getTranslations } from "next-intl/server";
import { AddClinicSheet } from "@/features/portal/add-clinic-sheet";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { PortalClinicsPanel } from "@/features/portal/portal-clinics-panel";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { sessionGet } from "@/shared/session-api";
import type { AdminClinicCard } from "@/features/portal/portal-clinics-panel";

export default async function PortalClinicsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  prepareLocale(locale);
  await requireSuperAdmin();
  const t = await getTranslations("catalog");
  const platform = await getTranslations("platform");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const clinics = (await sessionGet<AdminClinicCard[]>("/admin/clinics")) ?? [];

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={t("clinicsTitle")}>
      <PortalClinicsPanel
        clinics={clinics}
        searchPlaceholder={t("clinicSearchPlaceholder")}
        searchAriaLabel={t("clinicSearchAria")}
        clearLabel={t("clearClinicSearch")}
        emptyLabel={t("emptyClinicSearch")}
        action={
          <AddClinicSheet
            addLabel={portal("addClinic")}
            closeLabel={portal("closeSheet")}
            title={platform("title")}
            hint={platform("hint")}
            submitLabel={platform("submit")}
          />
        }
      />
    </AdminPortalShell>
  );
}
