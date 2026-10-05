export type CatalogLocale = "en" | "ru";

export type ClinicLocaleRow = {
  locale: string;
  name: string;
  district: string;
  address: string;
  description: string;
};

export type DoctorLocaleRow = {
  locale: string;
  name: string;
  specialty: string;
  bio: string;
};

type NamedLocale = { locale: string; name: string };

export function catalogLocale(value: unknown): CatalogLocale | null {
  return value === "en" || value === "ru" ? value : null;
}

function filled(base: string, next: string | undefined): string {
  const value = next?.trim() ?? "";
  return value || base;
}

function rowFor<T extends { locale: string }>(rows: T[] | undefined, locale: CatalogLocale | null): T | undefined {
  if (!locale) return undefined;
  return rows?.find((item) => item.locale === locale);
}

export function applyClinic<T extends {
  name: string;
  district: string;
  address: string;
  description: string;
  locales?: ClinicLocaleRow[];
  branches?: { name: string; address: string }[];
}>(clinic: T, locale: CatalogLocale | null): Omit<T, "locales"> {
  const { locales, ...rest } = clinic;
  const copy = rowFor(locales, locale);
  const address = filled(rest.address, copy?.address);
  return {
    ...rest,
    name: filled(rest.name, copy?.name),
    district: filled(rest.district, copy?.district),
    address,
    description: filled(rest.description, copy?.description),
    branches: rest.branches?.map((branch) => ({
      ...branch,
      address: branch.address === rest.address ? address : branch.address,
    })),
  };
}

export function applyDoctor<T extends {
  specialty: string;
  bio: string;
  locales?: DoctorLocaleRow[];
  user?: { displayName: string };
  clinic: { name: string; locales?: NamedLocale[] };
}>(doctor: T, locale: CatalogLocale | null) {
  const { locales, clinic, user, ...rest } = doctor;
  const copy = rowFor(locales, locale);
  const { locales: clinicLocales, ...clinicRest } = clinic;
  const clinicCopy = rowFor(clinicLocales, locale);
  return {
    ...rest,
    ...(user ? { user: { ...user, displayName: filled(user.displayName, copy?.name) } } : {}),
    specialty: filled(rest.specialty, copy?.specialty),
    bio: filled(rest.bio, copy?.bio),
    clinic: { ...clinicRest, name: filled(clinicRest.name, clinicCopy?.name) },
  };
}

export function applyReview<T extends {
  body: string;
  reply: string | null;
  locales?: { body: string; reply: string }[];
}>(review: T) {
  const { locales, ...rest } = review;
  const copy = locales?.[0];
  const reply = copy?.reply.trim() ? copy.reply : rest.reply;
  return { ...rest, body: filled(rest.body, copy?.body), reply };
}

export function applyOfferingDoctor<T extends {
  doctor: { user: { displayName: string }; locales?: { name: string }[] } | null;
}>(offering: T) {
  const doctor = offering.doctor;
  if (!doctor) return offering;
  const { locales, ...doctorRest } = doctor;
  return {
    ...offering,
    doctor: {
      ...doctorRest,
      user: { displayName: filled(doctor.user.displayName, locales?.[0]?.name) },
    },
  };
}

export function labelFor(value: string, labels: Record<string, string>): string {
  return labels[value]?.trim() || value;
}
