import type { AppLocale } from "@/i18n/routing";

export function LocaleFlag({ locale }: { locale: AppLocale }) {
  const className = "h-[11px] w-4 shrink-0 rounded-sm shadow-[inset_0_0_0_1px_rgba(20,36,40,0.12)]";
  if (locale === "hy") {
    return (
      <svg className={className} viewBox="0 0 18 12" aria-hidden="true">
        <rect width="18" height="4" y="0" fill="#D90012" />
        <rect width="18" height="4" y="4" fill="#0033A0" />
        <rect width="18" height="4" y="8" fill="#F2A800" />
      </svg>
    );
  }
  if (locale === "ru") {
    return (
      <svg className={className} viewBox="0 0 18 12" aria-hidden="true">
        <rect width="18" height="4" y="0" fill="#FFFFFF" stroke="#D0D5D4" strokeWidth="0.3" />
        <rect width="18" height="4" y="4" fill="#0039A6" />
        <rect width="18" height="4" y="8" fill="#D52B1E" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 18 12" aria-hidden="true">
      <rect width="18" height="12" fill="#012169" />
      <path d="M0 0L18 12M18 0L0 12" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M0 0L18 12M18 0L0 12" stroke="#C8102E" strokeWidth="1" />
      <path d="M9 0V12M0 6H18" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M9 0V12M0 6H18" stroke="#C8102E" strokeWidth="1.6" />
    </svg>
  );
}
