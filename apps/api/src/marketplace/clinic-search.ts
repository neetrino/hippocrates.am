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

/** Match the official name or a translation in any stored locale. */
export function clinicNameSearch(name: string): Prisma.ClinicWhereInput[] {
  const contains = { contains: name, mode: "insensitive" as const };
  return [{ name: contains }, { locales: { some: { name: contains } } }];
}
