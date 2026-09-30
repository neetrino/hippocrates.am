import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { JsonForm } from "@/shared/json-form";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className="auth-wrap panel">
      <h1>{t("registerTitle")}</h1>
      <p className="muted">{t("registerHint")}</p>
      <JsonForm
        action="/auth/register"
        label={t("registerAction")}
        next="/"
        fields={[
          { name: "displayName", label: t("displayName") },
          { name: "email", label: t("email"), type: "email" },
          { name: "password", label: t("password"), type: "password" },
        ]}
      />
    </section>
  );
}
