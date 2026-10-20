"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getPathname, Link } from "@/i18n/navigation";

type VerifyState = "pending" | "invalid";

export function VerifyEmailForm({ token }: { token: string }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [state, setState] = useState<VerifyState>(token ? "pending" : "invalid");

  useEffect(() => {
    if (!token) return;
    let active = true;
    void fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verify-email`, {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((response) => {
      if (!active) return;
      if (!response.ok) {
        setState("invalid");
        return;
      }
      window.location.assign(getPathname({ locale, href: "/me" }));
    });
    return () => {
      active = false;
    };
  }, [locale, token]);

  if (state === "invalid") {
    return (
      <p className="m-0 text-[0.95rem] leading-relaxed text-danger">
        {t("verifyInvalid")}{" "}
        <Link href="/login" className="font-semibold text-ink underline underline-offset-4 hover:text-accent">
          {t("goLogin")}
        </Link>
      </p>
    );
  }

  return <p className="m-0 text-[0.95rem] leading-relaxed text-ink">{t("verifyPending")}</p>;
}
