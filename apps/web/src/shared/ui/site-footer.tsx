import { getTranslations } from "next-intl/server";
import { cx } from "@/shared/ui/cx";
import primitives from "@/shared/ui/primitives.module.css";
import styles from "@/shared/ui/site-footer.module.css";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  return (
    <footer className={styles.footer}>
      <div className={cx(primitives.shell, styles.row)}>
        <strong>Hippocrates</strong>
        <p className={primitives.muted}>{t("tagline")}</p>
      </div>
    </footer>
  );
}
