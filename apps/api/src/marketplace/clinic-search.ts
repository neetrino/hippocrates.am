import type { Prisma } from "../generated/prisma/client";

export type ClinicCopy = {
  name: string;
  district: string;
  address: string;
};

/** Official Armenian fields plus every saved translation. */
export function clinicCopies(clinic: ClinicCopy & { locales?: ClinicCopy[] }): ClinicCopy[] {
  const official = { name: clinic.name, district: clinic.district, address: clinic.address };
  const translations = (clinic.locales ?? []).map((row) => ({
    name: row.name,
    district: row.district,
    address: row.address,
  }));
  return [official, ...translations];
}

type ClinicNameRow = {
  name: string;
  locales?: { name: string }[];
};

/** Official name plus every saved translation of the clinic name. */
export function clinicNameSpellings(clinic: ClinicNameRow): string[] {
  const parts = [clinic.name, ...(clinic.locales ?? []).map((row) => row.name)];
  return [...new Set(parts.map((part) => part.trim()).filter(Boolean))];
}

/** True when every query word is a prefix of a name word in any spelling. */
export function matchesClinicName(spellings: string[], query: string): boolean {
  const tokens = wordsOf(query);
  if (tokens.length === 0) return true;
  const names = spellings.flatMap(wordsOf);
  return tokens.every((token) => names.some((word) => word.startsWith(token)));
}

export function filterClinicsByName<T extends ClinicNameRow>(rows: T[], query: string): T[] {
  const needle = query.trim();
  if (!needle) return rows;
  return rows.filter((clinic) => matchesClinicName(clinicNameSpellings(clinic), needle));
}

/** Coarse name lookup before prefix filtering. */
export function clinicNameSearch(name: string): Prisma.ClinicWhereInput[] {
  const contains = { contains: name, mode: "insensitive" as const };
  return [{ name: contains }, { locales: { some: { name: contains } } }];
}

function wordsOf(value: string): string[] {
  return value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
}
