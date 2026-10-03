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
};

export function PatientPortalShell({ children, title, eyebrow, action }: PatientPortalShellProps) {
  const t = useTranslations("portal");
  const nav = useTranslations("nav");
  const me = useTranslations("me");
  const items: PortalNavItem[] = [
    { href: "/me", label: t("dashboard"), icon: <DashboardIcon />, match: "exact" },
    { href: "/me", hash: "visits", label: me("visits"), icon: <VisitsIcon />, match: "hash" },
    { href: "/me", hash: "favorites", label: me("favorites"), icon: <FavoritesIcon />, match: "hash" },
    { href: "/me", hash: "questions", label: nav("questions"), icon: <QuestionsIcon />, match: "hash" },
    { href: "/me", hash: "reviews", label: me("reviews"), icon: <ReviewsIcon />, match: "hash" },
  ];
  const footerItems: PortalNavItem[] = [
    { href: "/me", hash: "notices", label: me("notices"), icon: <NoticesIcon />, match: "hash" },
    { href: "/me", hash: "settings", label: me("settings"), icon: <SettingsIcon />, match: "hash" },
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
    >
      {children}
    </PortalShell>
  );
}
