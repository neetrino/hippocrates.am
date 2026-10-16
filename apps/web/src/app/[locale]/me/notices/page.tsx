import { getTranslations } from "next-intl/server";
import { DoctorPortalShell } from "@/features/portal/doctor-portal-shell";
import { NoticeList } from "@/features/portal/notice-list";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { Link, redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";
import { emptyNoticePage, noticePageLimit, type NoticePage } from "@/shared/notice";
import type { Me } from "@/shared/public-types";
import { sessionGet } from "@/shared/session-api";

export default async function PatientNoticesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
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
  if (me.role === "ADMIN") redirect({ href: "/clinic/notices", locale });
  if (me.role !== "PATIENT" && me.role !== "DOCTOR") redirect({ href: "/me", locale });
  const page = (await sessionGet<NoticePage>(`/me/notifications?limit=${noticePageLimit}`)) ?? emptyNoticePage;
  const list = (
    <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
      <NoticeList page={page} audience={me.role === "DOCTOR" ? "doctor" : "patient"} />
    </section>
  );
  if (me.role === "DOCTOR") {
    return (
      <DoctorPortalShell eyebrow="" title={t("notices")}>
        {list}
      </DoctorPortalShell>
    );
  }

  return (
    <PatientPortalShell eyebrow={common("PATIENT")} title={t("notices")}>
      {list}
    </PatientPortalShell>
  );
}
