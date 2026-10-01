import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/features/auth/login-form";
import styles from "@/features/auth/auth.module.css";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <Link href="/" className={styles.logoLink} aria-label="Hippocrates">
            <Image
              src="/brand/hippocrates-logo.png"
              alt="Hippocrates"
              width={180}
              height={110}
              className={styles.logo}
              priority
            />
          </Link>
        </div>
        <div className={styles.copy}>
          <h1>{t("loginTitle")}</h1>
          <p className={styles.hint}>{t("loginHint")}</p>
        </div>
        <LoginForm />
        <p className={styles.switchLine}>
          {t("noAccount")}{" "}
          <Link href="/register">{t("goRegister")}</Link>
        </p>
      </div>
    </section>
  );
}
