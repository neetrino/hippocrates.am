import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { JsonForm } from "@/shared/json-form";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

export default async function PlatformPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("platform");
  return (
    <section className={cx(ui.shell, ui.section)}>
      <div className={cx(ui.authWrap, ui.panel)}>
        <h1>{t("title")}</h1>
        <p className={ui.muted}>{t("hint")}</p>
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
