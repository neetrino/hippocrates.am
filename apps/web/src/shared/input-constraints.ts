/** Keep phone characters only: digits and at most one leading +. */
export function sanitizePhoneInput(value: string): string {
  const digitsAndPlus = value.replace(/[^\d+]/g, "");
  if (!digitsAndPlus.includes("+")) return digitsAndPlus;
  return `+${digitsAndPlus.replace(/\+/g, "")}`;
}

/** Keep letters (any script), spaces, apostrophes, and hyphens — no digits. */
export function sanitizeNameInput(value: string): string {
  return value.replace(/[^\p{L}\s'-]/gu, "");
}

export function isPhoneFieldName(name: string): boolean {
  return /phone/i.test(name);
}

export function isNameFieldName(name: string): boolean {
  return /^(name|surname|adminName|displayName)$/i.test(name) || /(^|[a-z])Name$/i.test(name);
}
