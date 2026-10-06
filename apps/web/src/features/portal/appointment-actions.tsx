"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/shared/ui/cn";

type AppointmentActionsProps = {
  id: string;
  status: string;
  startsAt: string;
  mode: "patient" | "admin";
};

export function AppointmentActions(props: AppointmentActionsProps) {
  const t = useTranslations("common");
  const [error, setError] = useState("");
  const started = visitStarted(props.startsAt);
  const open = props.status === "REQUESTED" || props.status === "CONFIRMED";
  const canConfirm = props.mode === "admin" && props.status === "REQUESTED" && !started;
  const canComplete = props.mode === "admin" && props.status === "CONFIRMED" && started;
  const canCancel = open && (props.mode === "admin" || !started);
  if (!canConfirm && !canComplete && !canCancel) return null;

  async function post(path: string): Promise<void> {
    setError("");
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, { method: "POST", credentials: "include" });
    if (response.ok) {
      window.location.reload();
      return;
    }
    const body = (await response.json().catch(() => null)) as { error?: { message?: string } } | null;
    setError(body?.error?.message || t("failed"));
  }

  const btn =
    "inline-flex cursor-pointer items-center justify-center rounded-full border-0 px-3.5 py-2 text-sm font-semibold text-white transition-[background,box-shadow] duration-160";

  return (
    <div className="grid justify-items-start gap-2">
      <div className="flex flex-wrap gap-2">
        {canConfirm ? (
          <button className={cn(btn, "bg-accent hover:bg-accent-hover hover:shadow-accent")} type="button" onClick={() => void post(`/appointments/${props.id}/confirm`)}>
            {t("confirm")}
          </button>
        ) : null}
        {canComplete ? (
          <button className={cn(btn, "bg-accent hover:bg-accent-hover hover:shadow-accent")} type="button" onClick={() => void post(`/appointments/${props.id}/complete`)}>
            {t("complete")}
          </button>
        ) : null}
        {canCancel ? (
          <button className={cn(btn, "bg-danger")} type="button" onClick={() => void post(`/appointments/${props.id}/cancel`)}>
            {t("cancel")}
          </button>
        ) : null}
      </div>
      {error ? <p className="m-0 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function visitStarted(startsAt: string): boolean {
  return Date.parse(startsAt) <= Date.now();
}
