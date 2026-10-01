import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/features/auth/register-form";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-copy">
          <h1>{t("registerTitle")}</h1>
          <p className="muted">{t("registerHint")}</p>
        </div>
        <RegisterForm />
        <p className="auth-switch-line">
          {t("hasAccount")}{" "}
          <Link href="/login">{t("goLogin")}</Link>
        </p>
      </div>
    </section>
  );
}
