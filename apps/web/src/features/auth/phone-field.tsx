"use client";

const COUNTRY_OPTIONS = [
  { id: "am", label: "AM +374", dial: "374" },
  { id: "ru", label: "RU +7", dial: "7" },
  { id: "us", label: "US +1", dial: "1" },
  { id: "ge", label: "GE +995", dial: "995" },
] as const;

type PhoneFieldProps = {
  label: string;
  hint: string;
};

export function PhoneField({ label, hint }: PhoneFieldProps) {
  return (
    <div className="field phone-field">
      <span>{label}</span>
      <div className="phone-field-row">
        <select
          className="phone-code"
          name="phoneCountry"
          defaultValue="am"
          aria-label={label}
        >
          {COUNTRY_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <input
          className="phone-local"
          name="phoneLocal"
          type="tel"
          inputMode="numeric"
          placeholder="(44) 88-18-22"
          required
          autoComplete="tel-national"
          onInput={(event) => {
            event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
          }}
        />
      </div>
      <p className="phone-field-hint">{hint}</p>
    </div>
  );
}

export function buildPhoneNumber(countryId: string, localDigits: string): string {
  const option = COUNTRY_OPTIONS.find((item) => item.id === countryId) ?? COUNTRY_OPTIONS[0];
  return `+${option.dial}${localDigits.replace(/\D/g, "")}`;
}
