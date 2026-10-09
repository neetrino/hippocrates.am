"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  ClinicsIcon,
  DashboardIcon,
  FinanceIcon,
  NoticesIcon,
  PatientsIcon,
  ReviewsIcon,
  ServicesIcon,
  SettingsIcon,
  StaffIcon,
  VisitsIcon,
} from "@/features/portal/admin-sidebar-icons";
import { PortalShell, type PortalNavItem } from "@/features/portal/portal-shell";

type ClinicManagerShellProps = {
  children: ReactNode;
  title: string;
  eyebrow: string;
};

export function ClinicManagerShell({ children, title, eyebrow }: ClinicManagerShellProps) {
  const portal = useTranslations("portal");
  const me = useTranslations("me");
  const desk = useTranslations("desk");
  const items: PortalNavItem[] = [
    { href: "/clinic", label: portal("dashboard"), icon: <DashboardIcon />, match: "exact" },
    { href: "/clinic/profile", label: portal("clinicProfile"), icon: <ClinicsIcon />, match: "exact" },
    { href: "/clinic/staff", label: portal("staff"), icon: <StaffIcon />, match: "exact" },
    { href: "/clinic/services", label: portal("services"), icon: <ServicesIcon />, match: "exact" },
    { href: "/clinic/visits", label: me("visits"), icon: <VisitsIcon />, match: "exact" },
    { href: "/clinic/patients", label: desk("patientList"), icon: <PatientsIcon />, match: "prefix" },
    { href: "/clinic/reviews", label: me("reviews"), icon: <ReviewsIcon />, match: "exact" },
    { href: "/clinic/notices", label: me("notices"), icon: <NoticesIcon />, match: "exact" },
    { href: "/clinic/finance", label: portal("finance"), icon: <FinanceIcon />, match: "exact" },
    { href: "/clinic/settings", label: me("settings"), icon: <SettingsIcon />, match: "exact" },
  ];

  return (
    <PortalShell
      accountHref="/clinic"
      subtitle={portal("patientSubtitle")}
      navLabel={portal("patientNavLabel")}
      items={items}
      footerItems={[]}
      title={title}
      eyebrow={eyebrow}
      plainLabels
    >
      {children}
    </PortalShell>
  );
}
