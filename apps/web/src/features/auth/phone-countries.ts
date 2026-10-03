/** National number lengths, without the trunk prefix. Keep in sync with the API copy. */
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

export function countryByIso(iso: string): PhoneCountry {
  const found = PHONE_COUNTRIES.find((country) => country.iso === iso);
  if (found) return found;
  const fallback = PHONE_COUNTRIES[0];
  if (!fallback) throw new Error("Phone country list is empty");
  return fallback;
}

export function phoneMaxLength(country: PhoneCountry): number {
  return Math.max(...country.lengths);
}

/** Placeholder uses the shortest accepted length so the hint matches a valid number. */
export function phonePlaceholder(country: PhoneCountry): string {
  const length = country.lengths[0] ?? phoneMaxLength(country);
  if (country.lengths.length === 1 && length === 8) return "(XX) XX-XX-XX";
  const groups: string[] = [];
  let remaining = length;
  while (remaining > 0) {
    const size = remaining === 3 ? 3 : Math.min(2, remaining);
    groups.push("X".repeat(size));
    remaining -= size;
  }
  return groups.join(" ");
}

export function readPhone(form: FormData): { iso: string; local: string } {
  return {
    iso: String(form.get("phoneCountry") ?? "AM"),
    local: String(form.get("phoneLocal") ?? "").replace(/\D/g, ""),
  };
}

/** E.164 when the local length is legal for that country. Empty or invalid returns null. */
export function toE164(iso: string, localDigits: string): string | null {
  const country = PHONE_COUNTRIES.find((item) => item.iso === iso);
  if (!country) return null;
  const local = localDigits.replace(/\D/g, "");
  if (!country.lengths.includes(local.length)) return null;
  return `+${country.dial}${local}`;
}

export function normalizeLocalDigits(country: PhoneCountry, raw: string): string {
  let digits = raw.replace(/\D/g, "");
  const max = phoneMaxLength(country);
  if (digits.startsWith(country.dial) && digits.length > max) {
    digits = digits.slice(country.dial.length);
  }
  if (country.iso !== "IT" && digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, max);
}

/** Splits a stored number. An over-long local part is kept so it can be corrected. */
export function splitPhone(phone: string | null | undefined): { iso: string; local: string } {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return { iso: "AM", local: "" };
  return matchDigits(digits) ?? looseSplit(digits);
}

function matchDigits(digits: string): { iso: string; local: string } | null {
  const candidates = longestDial(digits);
  const chosen = candidates.find((country) => country.lengths.includes(digits.length - country.dial.length));
  if (!chosen) return null;
  return { iso: chosen.iso, local: digits.slice(chosen.dial.length) };
}

function looseSplit(digits: string): { iso: string; local: string } {
  const chosen = longestDial(digits)[0];
  if (!chosen) return { iso: "AM", local: "" };
  return { iso: chosen.iso, local: digits.slice(chosen.dial.length) };
}

function longestDial(digits: string): PhoneCountry[] {
  let best = 0;
  const matches: PhoneCountry[] = [];
  for (const country of PHONE_COUNTRIES) {
    if (!digits.startsWith(country.dial)) continue;
    if (country.dial.length > best) {
      best = country.dial.length;
      matches.length = 0;
      matches.push(country);
    } else if (country.dial.length === best) {
      matches.push(country);
    }
  }
  return matches;
}
