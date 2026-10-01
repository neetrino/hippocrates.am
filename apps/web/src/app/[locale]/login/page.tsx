import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/features/auth/login-form";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-copy">
          <h1>{t("loginTitle")}</h1>
          <p className="muted">{t("loginHint")}</p>
        </div>
        <LoginForm />
        <p className="auth-switch-line">
          {t("noAccount")}{" "}
          <Link href="/register">{t("goRegister")}</Link>
        </p>
      </div>
    </section>
  );
}
