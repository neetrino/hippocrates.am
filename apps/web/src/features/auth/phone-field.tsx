"use client";

const ARMENIA_DIAL_CODE = "374";

type PhoneFieldProps = {
  label: string;
};

export function PhoneField({ label }: PhoneFieldProps) {
  return (
    <div className="field phone-field">
      <span>{label}</span>
      <div className="phone-field-row">
        <span className="phone-code" aria-hidden="true">
          +{ARMENIA_DIAL_CODE}
        </span>
        <input
          className="phone-local"
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
