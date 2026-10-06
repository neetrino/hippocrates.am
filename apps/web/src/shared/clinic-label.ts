/** Latin or Russian clinic spelling when the clinic has written one. Otherwise the official name. */
export function clinicDisplayName(
  clinic: { name: string; locales?: { locale: string; name: string }[] },
  locale: string,
): string {
  if (locale === "hy") return clinic.name;
  const localized = clinic.locales?.find((item) => item.locale === locale)?.name.trim() ?? "";
  return localized || clinic.name;
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
