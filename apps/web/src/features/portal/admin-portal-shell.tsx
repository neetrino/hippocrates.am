"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ClinicsIcon, DashboardIcon, QuestionsIcon } from "@/features/portal/admin-sidebar-icons";
import { PortalShell, type PortalNavItem } from "@/features/portal/portal-shell";

type AdminPortalShellProps = {
  children: ReactNode;
  title: string;
  eyebrow: string;
  action?: ReactNode;
};

export function AdminPortalShell({ children, title, eyebrow, action }: AdminPortalShellProps) {
  const t = useTranslations("portal");
  const nav = useTranslations("nav");
  const items: PortalNavItem[] = [
    { href: "/super-admin", label: t("dashboard"), icon: <DashboardIcon />, match: "exact" },
    { href: "/super-admin/clinics", label: nav("clinics"), icon: <ClinicsIcon />, match: "prefix" },
    { href: "/super-admin/questions", label: nav("questions"), icon: <QuestionsIcon />, match: "prefix" },
  ];

  return (
    <PortalShell
      accountHref="/super-admin"
      subtitle={t("subtitle")}
      items={items}
      footerItems={[]}
      title={title}
      eyebrow={eyebrow}
      action={action}
    >
      {children}
    </PortalShell>
  );
}
