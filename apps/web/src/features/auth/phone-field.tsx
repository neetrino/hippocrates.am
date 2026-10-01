"use client";

import auth from "@/features/auth/auth.module.css";
import styles from "@/features/auth/phone-field.module.css";

const ARMENIA_DIAL_CODE = "374";

type PhoneFieldProps = {
  label: string;
};

export function PhoneField({ label }: PhoneFieldProps) {
  return (
    <div className={auth.field}>
      <span>{label}</span>
      <div className={styles.row}>
        <span className={styles.code} aria-hidden="true">
          +{ARMENIA_DIAL_CODE}
        </span>
        <input
          className={styles.local}
          name="phoneLocal"
          type="tel"
          inputMode="numeric"
          placeholder="(XX) XX-XX-XX"
          required
          autoComplete="tel-national"
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
          }}
        />
      </div>
    </div>
  );
}

export function buildPhoneNumber(localDigits: string): string {
  return `+${ARMENIA_DIAL_CODE}${localDigits.replace(/\D/g, "")}`;
}
