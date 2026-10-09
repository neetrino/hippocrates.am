import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { Link } from "@/i18n/navigation";
import { formatAmount } from "@/shared/format";
import type { Me } from "@/shared/public-types";

export type PlatformSummary = {
  clinics: number;
  pendingQuestions: number;
  publishedDoctors: number;
};

type SuperAdminHomeProps = {
  me: Me;
  summary: PlatformSummary;
};

const statCard = "grid gap-1 rounded-[1.4rem] bg-white px-5 py-5 shadow-soft";

function StatValue({ label, value }: { label: string; value: number }) {
  return (
    <>
      <span className="text-[1.7rem] leading-none font-semibold text-ink">{formatAmount(value)}</span>
      <span className="text-sm text-muted">{label}</span>
    </>
  );
}

export async function SuperAdminHome({ me, summary }: SuperAdminHomeProps) {
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={me.displayName}>
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Link href="/super-admin/clinics" className={`${statCard} transition-shadow duration-160 hover:shadow-accent`}>
            <StatValue label={portal("statClinics")} value={summary.clinics} />
          </Link>
          <Link href="/super-admin/questions" className={`${statCard} transition-shadow duration-160 hover:shadow-accent`}>
            <StatValue label={portal("statPendingQuestions")} value={summary.pendingQuestions} />
          </Link>
          <article className={statCard}>
            <StatValue label={portal("statPublishedDoctors")} value={summary.publishedDoctors} />
          </article>
        </div>
        <article className="max-w-md rounded-[1.4rem] bg-[#2a4a47] px-5 py-5 text-white shadow-soft">
          <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-white/60 uppercase">{portal("quickAction")}</p>
          <p className="mt-2 mb-4 text-[1.05rem] font-medium text-white/90">{portal("registerHint")}</p>
          <Link
            href="/super-admin/clinics"
            className="inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-160 hover:bg-accent-hover"
          >
            {t("openPlatform")}
          </Link>
        </article>
      </div>
    </AdminPortalShell>
  );
}
