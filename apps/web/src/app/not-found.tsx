import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className={cx(ui.shell, ui.section)}>
      <h1>{t("notFoundTitle")}</h1>
      <p className={ui.lede}>{t("notFoundHint")}</p>
      <Link className={ui.btn} href="/">{t("homeLink")}</Link>
    </div>
  );
}
