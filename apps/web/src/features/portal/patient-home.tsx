import { getTranslations } from "next-intl/server";
import { PatientAvatar } from "@/features/portal/patient-avatar";
import { PatientPortalShell } from "@/features/portal/patient-portal-shell";
import { Link } from "@/i18n/navigation";
import type { AppointmentCard, Me } from "@/shared/public-types";

type Notice = { id: string; body: string; createdAt: string };

type PatientHomeProps = {
  me: Me;
  appointments: AppointmentCard[];
  notices: Notice[];
};

export async function PatientHome({ me, appointments, notices }: PatientHomeProps) {
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const upcoming = appointments.filter((item) => item.status === "REQUESTED" || item.status === "CONFIRMED");

  return (
    <PatientPortalShell
      eyebrow={common("PATIENT")}
      title={me.displayName}
      portrait={<PatientAvatar name={me.displayName} photoUrl={me.photoUrl} className="h-12 w-12 text-lg" />}
    >
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-[1.4rem] bg-white px-5 py-5 shadow-soft">
          <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{t("upcoming")}</p>
          <p className="mt-2 mb-0 font-display text-[2rem] font-bold leading-none text-ink">{upcoming.length}</p>
        </article>
        <article className="rounded-[1.4rem] bg-white px-5 py-5 shadow-soft">
          <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">{portal("statNotices")}</p>
          <p className="mt-2 mb-0 font-display text-[2rem] font-bold leading-none text-ink">{notices.length}</p>
        </article>
        <article className="rounded-[1.4rem] bg-[#2a4a47] px-5 py-5 text-white shadow-soft sm:col-span-2 xl:col-span-1">
          <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-white/60 uppercase">{portal("quickAction")}</p>
          <p className="mt-2 mb-4 text-[1.05rem] font-medium text-white/90">{t("bookHint")}</p>
          <Link href="/clinics" className="inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-160 hover:bg-accent-hover">
            {t("bookVisit")}
          </Link>
        </article>
      </section>
    </PatientPortalShell>
  );
}
