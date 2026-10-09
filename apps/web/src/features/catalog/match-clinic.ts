import type { ClinicCard } from "@/shared/public-types";

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

function normalizePhone(value: string): string {
  return value.replace(/\D/g, "");
}

/** True when every word appears in the clinic name, address, district, or phone, in any stored language. */
export function matchesClinic(clinic: ClinicCard, query: string): boolean {
  const raw = query.trim();
  if (!raw) return true;

  const tokens = normalizeText(raw).split(/\s+/).filter(Boolean);
  const copies = clinic.copies?.length
    ? clinic.copies
    : [{ name: clinic.name, district: clinic.district, address: clinic.address }];
  const textHaystack = normalizeText(
    [...copies.flatMap((copy) => [copy.name, copy.district, copy.address]), clinic.phone].join(" "),
  );
  const phoneHaystack = normalizePhone(clinic.phone);

  return tokens.every((token) => {
    const phoneToken = normalizePhone(token);
    if (phoneToken.length >= 2 && phoneHaystack.includes(phoneToken)) return true;
    return textHaystack.includes(token);
  });
}
