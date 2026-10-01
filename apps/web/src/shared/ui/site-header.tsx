import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeaderShell } from "@/shared/ui/site-header-shell";
import { SiteNav } from "@/shared/ui/site-nav";
import styles from "@/shared/ui/site-header.module.css";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <SiteHeaderShell>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="Hippocrates">
          <Image
            src="/brand/hippocrates-logo.png"
            alt="Hippocrates"
            width={180}
            height={110}
            className={styles.brandLogo}
            priority
          />
        </Link>
        <SiteNav
          clinics={t("clinics")}
          doctors={t("doctors")}
          questions={t("questions")}
          login={t("login")}
          openMenu={t("openMenu")}
          closeMenu={t("closeMenu")}
        />
      </div>
    </SiteHeaderShell>
  );
}
