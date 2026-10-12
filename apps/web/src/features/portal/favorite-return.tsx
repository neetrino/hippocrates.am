import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** Returns from a favorite clinic or doctor back to the account list. */
export async function FavoriteReturn() {
  const t = await getTranslations("me");
  return (
    <Link href="/me/favorites" className="w-fit text-sm font-semibold text-accent hover:text-accent-hover">
      {t("favorites")}
    </Link>
  );
}
