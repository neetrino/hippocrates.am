import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { JsonForm } from "@/shared/json-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className="auth-wrap panel">
      <h1>{t("loginTitle")}</h1>
      <JsonForm
        action="/auth/login"
        label={t("enter")}
        next="/me"
        fields={[
          { name: "email", label: t("email"), type: "email" },
          { name: "password", label: t("password"), type: "password" },
        ]}
      />
    </section>
  );
}
