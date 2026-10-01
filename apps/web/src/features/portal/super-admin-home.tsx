import { getLocale, getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { Link } from "@/i18n/navigation";
import { asVisitStatus, formatAmount, formatWhen } from "@/shared/format";
import type { AppointmentCard, Me } from "@/shared/public-types";

type Notice = { id: string; body: string; createdAt: string };

type SuperAdminHomeProps = {
  me: Me;
  appointments: AppointmentCard[];
  notices: Notice[];
};

export async function SuperAdminHome({ me, appointments, notices }: SuperAdminHomeProps) {
  const locale = await getLocale();
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");
  const visitCount = appointments.length;
  const noticeCount = notices.length;

  return (
    <AdminPortalShell
      eyebrow={common("SUPER_ADMIN")}
      title={me.displayName}
      action={
        <Link
          href="/platform"
          className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-accent transition-[background,box-shadow] duration-160 hover:bg-accent-hover max-md:hidden"
        >
          {t("openPlatform")}
        </Link>
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <article className="rounded-[1.4rem] bg-white px-5 py-5 shadow-soft">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">
              {portal("statVisits")}
            </p>
            <p className="mt-2 mb-0 font-display text-[2rem] font-bold leading-none text-ink">
              {visitCount}
            </p>
          </article>
          <article className="rounded-[1.4rem] bg-white px-5 py-5 shadow-soft">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-muted uppercase">
              {portal("statNotices")}
            </p>
            <p className="mt-2 mb-0 font-display text-[2rem] font-bold leading-none text-ink">
              {noticeCount}
            </p>
          </article>
          <article className="rounded-[1.4rem] bg-[#2a4a47] px-5 py-5 text-white shadow-soft sm:col-span-2 xl:col-span-1">
            <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-white/60 uppercase">
              {portal("quickAction")}
            </p>
            <p className="mt-2 mb-4 text-[1.05rem] font-medium text-white/90">{portal("registerHint")}</p>
            <Link
              href="/platform"
              className="inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-160 hover:bg-accent-hover"
            >
              {t("openPlatform")}
            </Link>
          </article>
        </section>

        <section id="visits" className="scroll-mt-6 rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2>{t("visits")}</h2>
            <p className="m-0 text-sm text-muted">{portal("sectionCount", { count: visitCount })}</p>
          </div>
          {visitCount === 0 ? (
            <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{portal("emptyVisits")}</p>
          ) : (
            <div className="grid gap-3">
              {appointments.map((item) => {
                const status = asVisitStatus(item.status);
                return (
                  <article
                    className="grid gap-2 rounded-[1.15rem] border border-line bg-sand/70 px-4 py-4"
                    key={item.id}
                  >
                    <strong>{item.offering.name}</strong>
                    <p className="m-0 text-muted">
                      {item.clinic.name} · {item.doctor.user.displayName}
                    </p>
                    <p className="m-0">
                      {formatWhen(item.startsAt, locale)} · {status ? common(status) : item.status} ·{" "}
                      {common("price", { amount: formatAmount(item.priceAmd) })}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section id="notices" className="scroll-mt-6 rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2>{t("notices")}</h2>
            <p className="m-0 text-sm text-muted">{portal("sectionCount", { count: noticeCount })}</p>
          </div>
          {noticeCount === 0 ? (
            <p className="m-0 rounded-[1.1rem] bg-sand px-4 py-5 text-muted">{t("noNotices")}</p>
          ) : (
            <div className="grid gap-3">
              {notices.map((notice) => (
                <p
                  className="m-0 rounded-[1.1rem] border border-line bg-sand/70 px-4 py-3.5"
                  key={notice.id}
                >
                  {notice.body}
                </p>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminPortalShell>
  );
}
