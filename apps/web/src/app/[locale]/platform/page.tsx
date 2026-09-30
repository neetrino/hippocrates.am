import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { JsonForm } from "@/shared/json-form";

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("platform");
  return (
    <section className="shell section">
      <div className="auth-wrap panel">
        <h1>{t("title")}</h1>
        <p className="muted">{t("hint")}</p>
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
    </section>
  );
}
