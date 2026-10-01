import { getTranslations } from "next-intl/server";
import { AddClinicSheet } from "@/features/portal/add-clinic-sheet";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { PortalClinicsPanel } from "@/features/portal/portal-clinics-panel";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard } from "@/shared/public-types";

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
  const clinics = await publicGet<ClinicCard[]>("/public/clinics");

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
            fields={[
              {
                name: "name",
                label: platform("clinicName"),
                kind: "name",
                placeholder: platform("clinicNamePlaceholder"),
              },
              {
                name: "address",
                label: platform("address"),
                placeholder: platform("addressPlaceholder"),
              },
              {
                name: "phone",
                label: platform("phone"),
                kind: "phone",
              },
              {
                name: "adminName",
                label: platform("adminName"),
                kind: "name",
                placeholder: platform("adminNamePlaceholder"),
              },
              {
                name: "adminEmail",
                label: platform("adminEmail"),
                type: "email",
                placeholder: platform("adminEmailPlaceholder"),
              },
              {
                name: "adminPassword",
                label: platform("adminPassword"),
                type: "password",
                placeholder: platform("adminPasswordPlaceholder"),
              },
            ]}
          />
        }
      />
    </AdminPortalShell>
  );
}
