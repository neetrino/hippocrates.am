import type { DoctorCard } from "@/shared/public-types";

function normalizeText(value: string): string {
  return value.trim().toLocaleLowerCase();
}

/** True when every word appears in any stored language spelling. */
export function matchesDoctor(doctor: DoctorCard, query: string): boolean {
  const raw = query.trim();
  if (!raw) return true;

  const tokens = normalizeText(raw).split(/\s+/).filter(Boolean);
  const parts = doctor.searchText?.length
    ? doctor.searchText
    : [doctor.user.displayName, doctor.specialty, doctor.clinic.name, doctor.bio];
  const haystack = normalizeText(parts.join(" "));

  return tokens.every((token) => haystack.includes(token));
}
