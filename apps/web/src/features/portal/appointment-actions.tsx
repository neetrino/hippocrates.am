"use client";

import { useTranslations } from "next-intl";
import { cx } from "@/shared/ui/cx";
import ui from "@/shared/ui/primitives.module.css";

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
  return (
    <div className={ui.actions}>
      {props.mode === "admin" && props.status === "REQUESTED" ? (
        <button className={cx(ui.btn, ui.btnSmall)} type="button" onClick={() => void post(`/appointments/${props.id}/confirm`)}>{t("confirm")}</button>
      ) : null}
      {props.mode === "admin" && props.status === "CONFIRMED" ? (
        <button className={cx(ui.btn, ui.btnSmall)} type="button" onClick={() => void post(`/appointments/${props.id}/complete`)}>{t("complete")}</button>
      ) : null}
      <button className={cx(ui.btn, ui.btnSmall, ui.btnDanger)} type="button" onClick={() => void post(`/appointments/${props.id}/cancel`)}>{t("cancel")}</button>
    </div>
  );
}
