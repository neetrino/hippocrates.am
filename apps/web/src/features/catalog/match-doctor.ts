import type { DoctorCard } from "@/shared/public-types";

function wordsOf(value: string): string[] {
  return value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
}

/** True when every query word is a prefix of a name word in any stored language. */
export function matchesDoctor(doctor: DoctorCard, query: string): boolean {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return true;

  const spellings = doctor.nameSpellings?.length ? doctor.nameSpellings : [doctor.user.displayName];
  const names = spellings.flatMap(wordsOf);
  return tokens.every((token) => names.some((word) => word.startsWith(token)));
}
