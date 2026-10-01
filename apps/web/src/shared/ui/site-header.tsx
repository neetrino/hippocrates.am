import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteHeaderShell } from "@/shared/ui/site-header-shell";
import { SiteNav } from "@/shared/ui/site-nav";

export async function SiteHeader() {
  const t = await getTranslations("nav");
  return (
    <SiteHeaderShell>
      <div className="relative z-1 grid min-h-22 grid-cols-[1fr_auto_1fr] items-center gap-6 px-[18px] transition-[min-height] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-[.is-scrolled]:min-h-18 max-md:min-h-16 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-2.5 max-md:px-2.5 max-md:py-2 max-md:group-[.is-scrolled]:min-h-[58px]">
        <Link href="/" className="inline-flex min-w-0 items-center justify-self-start" aria-label="Hippocrates">
          <Image
            src="/brand/hippocrates-logo.png"
            alt="Hippocrates"
            width={180}
            height={110}
            className="block h-[62px] w-auto object-contain transition-[height] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-[.is-scrolled]:h-[50px] max-md:h-11 max-md:max-w-[140px] max-md:group-[.is-scrolled]:h-10"
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
