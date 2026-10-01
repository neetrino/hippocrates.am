import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { requireSuperAdmin } from "@/features/portal/require-super-admin";
import { prepareLocale } from "@/i18n/locale";
import { JsonForm } from "@/shared/json-form";

export default async function PortalRegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  prepareLocale(locale);
  await requireSuperAdmin();
  const t = await getTranslations("platform");
  const common = await getTranslations("common");

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={t("title")}>
      <div className="mx-auto grid w-[min(480px,100%)] gap-3.5 rounded-[1.6rem] border border-line bg-white p-5 shadow-soft md:p-7">
        <h2 className="text-[clamp(1.45rem,2.4vw,1.85rem)]">{t("title")}</h2>
        <p className="m-0 text-muted">{t("hint")}</p>
        <JsonForm
          action="/clinics"
          label={t("submit")}
          next="/me"
          fields={[
            { name: "name", label: t("clinicName") },
            { name: "address", label: t("address") },
            { name: "phone", label: t("phone") },
            { name: "adminName", label: t("adminName") },
            { name: "adminEmail", label: t("adminEmail"), type: "email" },
            { name: "adminPassword", label: t("adminPassword"), type: "password" },
          ]}
        />
      </div>
    </AdminPortalShell>
  );
}
