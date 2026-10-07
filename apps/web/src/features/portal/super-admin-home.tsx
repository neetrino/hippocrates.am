import { getTranslations } from "next-intl/server";
import { AdminPortalShell } from "@/features/portal/admin-portal-shell";
import { Link } from "@/i18n/navigation";
import type { Me } from "@/shared/public-types";

type SuperAdminHomeProps = {
  me: Me;
};

export async function SuperAdminHome({ me }: SuperAdminHomeProps) {
  const t = await getTranslations("me");
  const portal = await getTranslations("portal");
  const common = await getTranslations("common");

  return (
    <AdminPortalShell eyebrow={common("SUPER_ADMIN")} title={me.displayName}>
      <article className="max-w-md rounded-[1.4rem] bg-[#2a4a47] px-5 py-5 text-white shadow-soft">
        <p className="m-0 text-[0.72rem] font-bold tracking-[0.12em] text-white/60 uppercase">
          {portal("quickAction")}
        </p>
        <p className="mt-2 mb-4 text-[1.05rem] font-medium text-white/90">{portal("registerHint")}</p>
        <Link
          href="/super-admin/clinics"
          className="inline-flex rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-160 hover:bg-accent-hover"
        >
          {t("openPlatform")}
        </Link>
      </article>
    </AdminPortalShell>
  );
}
