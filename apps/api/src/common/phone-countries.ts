/** National number lengths, without the trunk prefix. Keep in sync with the web copy. */
export type PhoneCountry = {
  iso: string;
  dial: string;
  lengths: readonly number[];
};

export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  { iso: "AM", dial: "374", lengths: [8] },
  { iso: "RU", dial: "7", lengths: [10] },
  { iso: "KZ", dial: "7", lengths: [10] },
  { iso: "GE", dial: "995", lengths: [9] },
  { iso: "AZ", dial: "994", lengths: [9] },
  { iso: "UA", dial: "380", lengths: [9] },
  { iso: "BY", dial: "375", lengths: [9] },
  { iso: "MD", dial: "373", lengths: [8] },
  { iso: "UZ", dial: "998", lengths: [9] },
  { iso: "TR", dial: "90", lengths: [10] },
  { iso: "IR", dial: "98", lengths: [10] },
  { iso: "IQ", dial: "964", lengths: [10] },
  { iso: "SY", dial: "963", lengths: [8, 9] },
  { iso: "LB", dial: "961", lengths: [7, 8] },
  { iso: "JO", dial: "962", lengths: [8, 9] },
  { iso: "IL", dial: "972", lengths: [8, 9] },
  { iso: "SA", dial: "966", lengths: [9] },
  { iso: "AE", dial: "971", lengths: [8, 9] },
  { iso: "QA", dial: "974", lengths: [8] },
  { iso: "KW", dial: "965", lengths: [8] },
  { iso: "EG", dial: "20", lengths: [10] },
  { iso: "US", dial: "1", lengths: [10] },
  { iso: "CA", dial: "1", lengths: [10] },
  { iso: "GB", dial: "44", lengths: [10] },
  { iso: "DE", dial: "49", lengths: [10, 11] },
  { iso: "FR", dial: "33", lengths: [9] },
  { iso: "IT", dial: "39", lengths: [6, 7, 8, 9, 10, 11] },
  { iso: "ES", dial: "34", lengths: [9] },
  { iso: "PT", dial: "351", lengths: [9] },
  { iso: "NL", dial: "31", lengths: [9] },
  { iso: "BE", dial: "32", lengths: [8, 9] },
  { iso: "CH", dial: "41", lengths: [9] },
  { iso: "AT", dial: "43", lengths: [7, 8, 9, 10, 11, 12, 13] },
  { iso: "PL", dial: "48", lengths: [9] },
  { iso: "CZ", dial: "420", lengths: [9] },
  { iso: "RO", dial: "40", lengths: [9] },
  { iso: "BG", dial: "359", lengths: [8, 9] },
  { iso: "GR", dial: "30", lengths: [10] },
  { iso: "SE", dial: "46", lengths: [7, 8, 9, 10] },
  { iso: "NO", dial: "47", lengths: [8] },
  { iso: "FI", dial: "358", lengths: [6, 7, 8, 9, 10] },
  { iso: "EE", dial: "372", lengths: [7, 8] },
  { iso: "LV", dial: "371", lengths: [8] },
  { iso: "LT", dial: "370", lengths: [8] },
  { iso: "IN", dial: "91", lengths: [10] },
  { iso: "CN", dial: "86", lengths: [11] },
];

/** `+` and digits when the number matches one country's dial code and length. */
export function canonicalPhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (!matchDigits(digits)) return null;
  return `+${digits}`;
}

function matchDigits(digits: string): boolean {
  let best = 0;
  const candidates: PhoneCountry[] = [];
  for (const country of PHONE_COUNTRIES) {
    if (!digits.startsWith(country.dial)) continue;
    if (country.dial.length > best) {
      best = country.dial.length;
      candidates.length = 0;
      candidates.push(country);
    } else if (country.dial.length === best) {
      candidates.push(country);
    }
  }
  const national = digits.length - best;
  return candidates.some((country) => country.lengths.includes(national));
}
