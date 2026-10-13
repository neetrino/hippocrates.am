"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { acceptedImage, clinicImage } from "@/features/clinic/clinic-api";
import { Photo } from "@/shared/ui/photo";

export function ClinicCover({
  clinicId,
  coverUrl,
  name,
  editing,
}: {
  clinicId: string;
  coverUrl: string | null;
  name: string;
  editing: boolean;
}) {
  const t = useTranslations("desk");
  const me = useTranslations("me");
  const input = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  async function onFile(file: File | undefined): Promise<void> {
    if (!file) return;
    if (!acceptedImage(file)) {
      setMessage(me("photoInvalid"));
      return;
    }
    const ok = await clinicImage(`/clinics/${clinicId}/cover`, "POST", file);
    if (ok) window.location.reload();
    else setMessage(t("coverFailed"));
  }

  async function remove(): Promise<void> {
    const ok = await clinicImage(`/clinics/${clinicId}/cover`, "DELETE");
    if (ok) window.location.reload();
    else setMessage(t("coverFailed"));
  }

  return (
    <div className="grid gap-3">
      <div className="relative aspect-16/10 overflow-hidden bg-sand">
        <Photo src={coverUrl} alt={name} loading="eager" />
      </div>
      {editing ? (
        <div className="flex flex-wrap gap-3 px-5">
          <input
            ref={input}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            type="file"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
          <button className="cursor-pointer text-sm font-semibold text-accent" type="button" onClick={() => input.current?.click()}>
            {t("changeCover")}
          </button>
          {coverUrl ? (
            <button className="cursor-pointer text-sm font-semibold text-danger" type="button" onClick={() => void remove()}>
              {t("removeCover")}
            </button>
          ) : null}
        </div>
      ) : null}
      {message ? <p className="m-0 px-5 text-sm text-danger">{message}</p> : null}
    </div>
  );
}
