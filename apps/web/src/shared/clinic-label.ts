/** Latin or Russian clinic spelling when the clinic has written one. Otherwise the official name. */
export function clinicDisplayName(
  clinic: { name: string; locales?: { locale: string; name: string }[] },
  locale: string,
): string {
  if (locale === "hy") return clinic.name;
  const localized = clinic.locales?.find((item) => item.locale === locale)?.name.trim() ?? "";
  return localized || clinic.name;
}

/** Official clinic name plus every saved translation. */
export function clinicNameSpellings(clinic: { name: string; locales?: { name: string }[] }): string[] {
  return uniqueNames([clinic.name, ...(clinic.locales ?? []).map((item) => item.name)]);
}

/** Doctor name in the selected language when the clinic has written one. */
export function doctorDisplayName(
  doctor: { user: { displayName: string }; locales?: { locale: string; name: string }[] },
  locale: string,
): string {
  if (locale === "hy") return doctor.user.displayName;
  const localized = doctor.locales?.find((item) => item.locale === locale)?.name.trim() ?? "";
  return localized || doctor.user.displayName;
}

/** Official doctor name plus every saved translation. */
export function doctorNameSpellings(doctor: { user: { displayName: string }; locales?: { name: string }[] }): string[] {
  return uniqueNames([doctor.user.displayName, ...(doctor.locales ?? []).map((item) => item.name)]);
}

function uniqueNames(values: string[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const value of values) {
    const name = value.trim();
    const key = name.toLocaleLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}
