"use client";

const ARMENIA_DIAL_CODE = "374";

type PhoneFieldProps = {
  label: string;
};

export function PhoneField({ label }: PhoneFieldProps) {
  return (
    <div className="grid w-full min-w-0 gap-1.5 text-[0.92rem] font-semibold">
      <span>{label}</span>
      <div className="grid min-w-0 grid-cols-[minmax(96px,118px)_minmax(0,1fr)] gap-2">
        <span
          className="inline-flex w-full min-w-0 items-center rounded-xl border border-line bg-white px-3.5 py-3 text-[0.92rem] font-normal whitespace-nowrap text-ink"
          aria-hidden="true"
        >
          +{ARMENIA_DIAL_CODE}
        </span>
        <input
          className="w-full min-w-0 rounded-xl border border-line bg-white px-3.5 py-3 text-[0.92rem] font-normal text-ink placeholder:text-[#9aa6a5] focus:border-accent focus:shadow-[0_0_0_3px_rgba(0,167,157,0.16)] focus:outline-none"
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
