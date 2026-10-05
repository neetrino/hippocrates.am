import { getLocale, getTranslations } from "next-intl/server";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { Link, redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { formatWhen } from "@/shared/format";
import { noticeMessageKey } from "@/shared/notice-text";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

type Notice = { id: string; body: string; createdAt: string };

export default async function PatientNoticesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const displayLocale = await getLocale();
  const t = await getTranslations("me");
  const common = await getTranslations("common");
  const nav = await getTranslations("nav");
  const me = await sessionGet<Me>("/auth/me");
  if (!me) {
    return (
      <div className="mx-auto grid w-[min(var(--max-width-shell),calc(100%-48px))] gap-[18px] pt-7 pb-6 max-md:w-[min(var(--max-width-shell),calc(100%-20px))]">
        <p>
          {t("signIn")} <Link href="/login">{nav("login")}</Link>
        </p>
      </div>
    );
  }
  if (me.role === "SUPER_ADMIN") redirect({ href: "/super-admin", locale });
  if (me.role !== "PATIENT") redirect({ href: "/me", locale });
  const notices = (await sessionGet<Notice[]>("/me/notifications")) ?? [];

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("notices")}>
      <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
        {notices.length === 0 ? (
          <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>
        ) : (
          <div className="grid gap-3">
            {notices.map((notice) => {
              const messageKey = noticeMessageKey(notice.body);
              return (
                <article className="rounded-[1.1rem] border border-line bg-sand/70 px-4 py-3.5" key={notice.id}>
                  <p className="m-0">{messageKey ? t(messageKey) : notice.body}</p>
                  <time className="mt-1 block text-sm text-muted" dateTime={notice.createdAt}>
                    {formatWhen(notice.createdAt, displayLocale)}
                  </time>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </PatientPortalShell>
  );
}
