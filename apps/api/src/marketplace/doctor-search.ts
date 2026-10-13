import type { Prisma } from "../generated/prisma/client";

type DoctorSearchRow = {
  specialty: string;
  bio: string;
  user: { displayName: string };
  locales?: { name: string; specialty: string; bio: string }[];
  clinic: {
    name: string;
    district: string;
    locales?: { name: string; district: string }[];
  };
};

/** Every spelling used for client-side doctor search. */
export function doctorSearchText(doctor: DoctorSearchRow): string[] {
  const parts = [
    doctor.user.displayName,
    doctor.specialty,
    doctor.bio,
    doctor.clinic.name,
    doctor.clinic.district,
  ];
  for (const row of doctor.locales ?? []) {
    parts.push(row.name, row.specialty, row.bio);
  }
  for (const row of doctor.clinic.locales ?? []) {
    parts.push(row.name, row.district);
  }
  return [...new Set(parts.map((part) => part.trim()).filter(Boolean))];
}

/** Match the official fields or any saved translation. */
export function doctorNameSearch(name: string): Prisma.DoctorProfileWhereInput[] {
  const contains = { contains: name, mode: "insensitive" as const };
  return [
    { user: { displayName: contains } },
    { specialty: contains },
    { bio: contains },
    { locales: { some: { OR: [{ name: contains }, { specialty: contains }, { bio: contains }] } } },
    {
      clinic: {
        OR: [
          { name: contains },
          { district: contains },
          { locales: { some: { OR: [{ name: contains }, { district: contains }] } } },
        ],
      },
    },
  ];
}
