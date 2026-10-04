"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import {
  DashboardIcon,
  FavoritesIcon,
  NoticesIcon,
  QuestionsIcon,
  ReviewsIcon,
  SettingsIcon,
  VisitsIcon,
} from "@/features/portal/admin-sidebar-icons";
import { PortalShell, type PortalNavItem } from "@/features/portal/portal-shell";

type PatientPortalShellProps = {
  children: ReactNode;
  title: string;
  eyebrow: string;
  action?: ReactNode;
  portrait?: ReactNode;
};

export function PatientPortalShell({ children, title, eyebrow, action, portrait }: PatientPortalShellProps) {
  const t = useTranslations("portal");
  const nav = useTranslations("nav");
  const me = useTranslations("me");
  const items: PortalNavItem[] = [
    { href: "/me", label: t("dashboard"), icon: <DashboardIcon />, match: "exact" },
    { href: "/me/visits", label: me("visits"), icon: <VisitsIcon />, match: "exact" },
    { href: "/me/favorites", label: me("favorites"), icon: <FavoritesIcon />, match: "exact" },
    { href: "/me/questions", label: nav("questions"), icon: <QuestionsIcon />, match: "exact" },
    { href: "/me/reviews", label: me("reviews"), icon: <ReviewsIcon />, match: "exact" },
  ];
  const footerItems: PortalNavItem[] = [
    { href: "/me/notices", label: me("notices"), icon: <NoticesIcon />, match: "exact" },
    { href: "/me/settings", label: me("settings"), icon: <SettingsIcon />, match: "exact" },
  ];

  return (
    <PortalShell
      homeHref="/me"
      subtitle={t("patientSubtitle")}
      navLabel={t("patientNavLabel")}
      items={items}
      footerItems={footerItems}
      title={title}
      eyebrow={eyebrow}
      action={action}
      portrait={portrait}
    >
      {children}
    </PortalShell>
  );
}
