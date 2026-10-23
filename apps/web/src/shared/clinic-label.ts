import { latinizeArmenian } from "./armenian-latin";
import { knownSpecialty } from "./known-specialty";

type NameCopy = { locale: string; name: string };
type SpecialtyCopy = { locale: string; specialty: string };

type ContentLocale = "hy" | "en" | "ru";

export type ClinicCopyView = {
  locale: ContentLocale;
  name: string;
  district: string;
  address: string;
  description: string;
};

/** Saved translation wins. English without one uses a Latin reading. Armenian stays the source. */
export function portalName(name: string, locale: string, copies?: NameCopy[]): string {
  if (locale === "hy") return name;
  const written = copies?.find((item) => item.locale === locale)?.name.trim() ?? "";
  if (written) return written;
  return locale === "en" ? latinizeArmenian(name) : name;
}

/** Saved specialty wins. A known English wording is translated. Other English text is latinized. */
export function specialtyLabel(value: string, locale: string, copies?: SpecialtyCopy[]): string {
  const language = locale === "en" || locale === "ru" ? locale : "hy";
  const written = language === "hy" ? "" : copies?.find((item) => item.locale === language)?.specialty.trim() ?? "";
  if (written) return written;
  const known = knownSpecialty(value, language);
  if (known !== value) return known;
  return language === "en" ? latinizeArmenian(value) : value;
}

/** Page heading for a clinic: the saved copy, or a Latin reading of the Armenian source. */
export function shownClinicCopy(copies: ClinicCopyView[], locale: string): ClinicCopyView {
  const language = contentLocale(locale);
  const base = copies.find((item) => item.locale === "hy") ?? copies[0];
  const empty = { locale: language, name: "", district: "", address: "", description: "" };
  if (!base || language === "hy") return base ?? empty;
  const saved = copies.find((item) => item.locale === language);
  return {
    locale: language,
    name: portalName(base.name, language, saved ? [{ locale: language, name: saved.name }] : []),
    district: portalName(base.district, language, saved ? [{ locale: language, name: saved.district }] : []),
    address: portalName(base.address, language, saved ? [{ locale: language, name: saved.address }] : []),
    description: saved?.description.trim() || base.description,
  };
}

function contentLocale(locale: string): ContentLocale {
  return locale === "en" || locale === "ru" ? locale : "hy";
}

/** Latin or Russian clinic spelling when the clinic has written one. Otherwise the official name. */
export function clinicDisplayName(
  clinic: { name: string; locales?: { locale: string; name: string }[] },
  locale: string,
): string {
  return portalName(clinic.name, locale, clinic.locales);
}

/** Doctor name in the selected language when the clinic has written one. */
export function doctorDisplayName(
  doctor: { user: { displayName: string }; locales?: { locale: string; name: string }[] },
  locale: string,
): string {
  return portalName(doctor.user.displayName, locale, doctor.locales);
}
