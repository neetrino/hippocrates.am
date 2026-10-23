const SPECIALTIES: Record<string, { hy: string; en: string; ru: string }> = {
  "general dentist": {
    hy: "Ընդհանուր ատամնաբույժ",
    en: "General dentist",
    ru: "Стоматолог общей практики",
  },
};

/** A known specialty follows the page language. Any other wording stays as stored. */
export function knownSpecialty(value: string, locale: "hy" | "en" | "ru"): string {
  return SPECIALTIES[value.trim().toLowerCase()]?.[locale] ?? value;
}
