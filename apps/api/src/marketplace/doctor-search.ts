import type { Prisma } from "../generated/prisma/client";

type DoctorNameRow = {
  user: { displayName: string };
  locales?: { name: string }[];
};

/** Official name plus every saved translation of the doctor name. */
export function doctorNameSpellings(doctor: DoctorNameRow): string[] {
  const parts = [doctor.user.displayName, ...(doctor.locales ?? []).map((row) => row.name)];
  return [...new Set(parts.map((part) => part.trim()).filter(Boolean))];
}

/** True when every query word is a prefix of a name word in any spelling. */
export function matchesDoctorName(spellings: string[], query: string): boolean {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return true;
  const names = spellings.flatMap(wordsOf);
  return tokens.every((token) => names.some((word) => word.startsWith(token)));
}

export function filterDoctorsByName<T extends DoctorNameRow>(rows: T[], query: string): T[] {
  const needle = query.trim();
  if (!needle) return rows;
  return rows.filter((doctor) => matchesDoctorName(doctorNameSpellings(doctor), needle));
}

/** Coarse name lookup before prefix filtering. */
export function doctorNameSearch(name: string): Prisma.DoctorProfileWhereInput[] {
  const contains = { contains: name, mode: "insensitive" as const };
  return [{ user: { displayName: contains } }, { locales: { some: { name: contains } } }];
}

function wordsOf(value: string): string[] {
  return value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
}
