import type { ClinicCard } from "@/shared/public-types";

function wordsOf(value: string): string[] {
  return value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
}

function nameSpellingsOf(clinic: ClinicCard): string[] {
  if (clinic.nameSpellings?.length) return clinic.nameSpellings;
  if (clinic.copies?.length) return clinic.copies.map((copy) => copy.name);
  return [clinic.name];
}

/** True when every query word is a prefix of a clinic name word in any stored language. */
export function matchesClinicName(clinic: ClinicCard, query: string): boolean {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return true;
  const names = nameSpellingsOf(clinic).flatMap(wordsOf);
  return tokens.every((token) => names.some((word) => word.startsWith(token)));
}
