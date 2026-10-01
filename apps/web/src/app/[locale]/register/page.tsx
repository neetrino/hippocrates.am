import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/features/auth/register-form";
import { cx } from "@/shared/ui/cx";
import styles from "@/features/auth/auth.module.css";

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  prepareLocale(locale);
  const t = await getTranslations("auth");
  return (
    <section className={styles.page}>
      <div className={cx(styles.card, styles.cardWide)}>
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
          <h1>{t("registerTitle")}</h1>
          <p className={styles.hint}>{t("registerHint")}</p>
        </div>
        <RegisterForm />
        <p className={styles.switchLine}>
          {t("hasAccount")}{" "}
          <Link href="/login">{t("goLogin")}</Link>
        </p>
      </div>
    </section>
  );
}
