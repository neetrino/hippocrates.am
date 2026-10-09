"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SettingsPassword } from "@/features/portal/settings-password";
import { SettingsPhoto } from "@/features/portal/settings-photo";
import { SettingsProfile } from "@/features/portal/settings-profile";

type SettingsCardProps = {
  displayName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  roleLabel?: string;
};

const editButton =
  "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-line bg-white px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-160 hover:border-accent/35 hover:text-accent";

export function SettingsCard({ displayName, email, phone, photoUrl, roleLabel }: SettingsCardProps) {
  const t = useTranslations("me");
  const common = useTranslations("common");
  const role = roleLabel ?? common("PATIENT");
  const [editing, setEditing] = useState(false);

  return (
    <section className="rounded-[1.6rem] bg-white p-5 shadow-soft md:p-6">
      <SettingsPhoto
        name={displayName}
        photoUrl={photoUrl}
        roleLabel={role}
        changeLabel={t("changePhoto")}
        changeAction={t("photoChange")}
        deleteAction={t("photoDelete")}
        failed={t("photoFailed")}
        invalid={t("photoInvalid")}
        action={
          editing ? null : (
            <button type="button" onClick={() => setEditing(true)} className={editButton}>
              {t("editProfile")}
            </button>
          )
        }
      />
      <SettingsProfile
        displayName={displayName}
        email={email}
        phone={phone}
        editing={editing}
        onCancel={() => setEditing(false)}
        onSaved={() => setEditing(false)}
      />
      <SettingsPassword />
    </section>
  );
}
