import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeaderShell } from "@/shared/ui/site-header-shell";
import { SiteNav } from "@/shared/ui/site-nav";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <SiteHeaderShell>
      <div className="bar">
        <Link href="/" className="brand" aria-label="Hippocrates">
          <Image
            src="/brand/hippocrates-logo.png"
            alt="Hippocrates"
            width={180}
            height={110}
            className="brand-logo"
            priority
          />
        </Link>
        <SiteNav
          clinics={t("clinics")}
          doctors={t("doctors")}
          questions={t("questions")}
          register={t("register")}
          openMenu={t("openMenu")}
          closeMenu={t("closeMenu")}
        />
      </div>
    </SiteHeaderShell>
  );
}
