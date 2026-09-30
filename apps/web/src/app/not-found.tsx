import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <div className="shell section">
      <h1>{t("notFoundTitle")}</h1>
      <p className="lede">{t("notFoundHint")}</p>
      <Link className="btn" href="/">{t("homeLink")}</Link>
    </div>
  );
}
