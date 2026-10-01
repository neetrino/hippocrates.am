import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitch } from "@/shared/ui/locale-switch";
import { SiteHeaderShell } from "@/shared/ui/site-header-shell";
import { SiteNav } from "@/shared/ui/site-nav";

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M5.5 19.2c1.4-3.1 3.7-4.6 6.5-4.6s5.1 1.5 6.5 4.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
          openMenu={t("openMenu")}
          closeMenu={t("closeMenu")}
          actions={(
            <>
              <LocaleSwitch />
              <Link href="/register" className="auth-trigger" aria-label={t("register")}>
                <UserIcon />
              </Link>
            </>
          )}
        />
      </div>
    </SiteHeaderShell>
  );
}
