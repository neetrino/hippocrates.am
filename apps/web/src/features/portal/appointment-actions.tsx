"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/shared/ui/cn";

async function post(path: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
  });
  window.location.reload();
}

export function AppointmentActions(props: { id: string; status: string; mode: "patient" | "admin" }) {
  const t = useTranslations("common");
  if (props.status !== "REQUESTED" && props.status !== "CONFIRMED") return null;

  const btn =
    "inline-flex cursor-pointer items-center justify-center rounded-full border-0 px-3.5 py-2 text-sm font-semibold text-white transition-[background,box-shadow] duration-160";

  return (
    <div className="flex flex-wrap gap-2">
      {props.mode === "admin" && props.status === "REQUESTED" ? (
        <button className={cn(btn, "bg-accent hover:bg-accent-hover hover:shadow-accent")} type="button" onClick={() => void post(`/appointments/${props.id}/confirm`)}>{t("confirm")}</button>
      ) : null}
      {props.mode === "admin" && props.status === "CONFIRMED" ? (
        <button className={cn(btn, "bg-accent hover:bg-accent-hover hover:shadow-accent")} type="button" onClick={() => void post(`/appointments/${props.id}/complete`)}>{t("complete")}</button>
      ) : null}
      <button className={cn(btn, "bg-danger")} type="button" onClick={() => void post(`/appointments/${props.id}/cancel`)}>{t("cancel")}</button>
    </div>
  );
}
