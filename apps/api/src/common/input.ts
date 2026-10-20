import { AppError } from "./app-error";

export function requiredString(value: unknown, field: string, maxLength?: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError("VALIDATION_FAILED", 400, `${field} պարտադիր է`);
  }
  const text = value.trim();
  if (maxLength !== undefined && text.length > maxLength) {
    throw new AppError("VALIDATION_FAILED", 400, `${field} չափազանց երկար է`);
  }
  return text;
}

export function emailOf(value: unknown): string {
  const email = requiredString(value, "Էլ. փոստ", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("VALIDATION_FAILED", 400, "Էլ. փոստը սխալ է");
  }
  return email;
}

const COMMON_PASSWORDS = new Set(["password", "12345678", "qwerty123"]);

/** New passwords need 8–128 characters, a letter, and a digit. Login does not use this. */
export function passwordOf(value: unknown, email?: string): string {
  const password = requiredString(value, "Գաղտնաբառ", 128);
  if (!acceptablePassword(password)) {
    throw new AppError("VALIDATION_FAILED", 400, "Գաղտնաբառը առնվազն 8 նիշ է, մեկ տառով և մեկ թվով");
  }
  if (email && password.toLowerCase() === email.trim().toLowerCase()) {
    throw new AppError("VALIDATION_FAILED", 400, "Գաղտնաբառը չի կարող համընկնել էլ. փոստի հետ");
  }
  return password;
}

function acceptablePassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[\p{L}]/u.test(password) &&
    /\d/.test(password) &&
    !COMMON_PASSWORDS.has(password.toLowerCase())
  );
}

/** Display name: letters, spaces, apostrophes, and hyphens. */
export function displayNameOf(value: unknown): string {
  const name = requiredString(value, "Անուն").replace(/\s+/g, " ");
  if (name.length > 80 || !/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
    throw new AppError("VALIDATION_FAILED", 400, "Անունը կարող է պարունակել միայն տառեր");
  }
  return name;
}

/** Empty phone clears the field. A value must be +374 and exactly 8 digits. */
export function optionalPhoneOf(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const digits = value.replace(/\D/g, "");
  const local = digits.startsWith("374") ? digits.slice(3) : "";
  if (local.length !== 8 || local.startsWith("0")) {
    throw new AppError("VALIDATION_FAILED", 400, "Հեռախոսահամարը սխալ է");
  }
  return `+374${local}`;
}

/** Required phone in the same country format as `optionalPhoneOf`. */
export function requiredPhoneOf(value: unknown): string {
  const phone = optionalPhoneOf(value);
  if (!phone) throw new AppError("VALIDATION_FAILED", 400, "Հեռախոս պարտադիր է");
  return phone;
}

/** One name or surname: letters, spaces, apostrophes, and hyphens. */
export function namePartOf(value: unknown, field: string): string {
  const name = requiredString(value, field).replace(/\s+/g, " ");
  if (name.length > 40 || !/^[\p{L}][\p{L}\s'-]*$/u.test(name)) {
    throw new AppError("VALIDATION_FAILED", 400, `${field} կարող է պարունակել միայն տառեր`);
  }
  return name;
}

/** Letters only, any Unicode script (hy, en, ru, ...). */
export function personNameOf(value: unknown, field: string): string {
  const raw = requiredString(value, field);
  const name = raw.replace(/[^\p{L}]/gu, "");
  if (name.length < 1 || !/^[\p{L}]+$/u.test(name)) {
    throw new AppError("VALIDATION_FAILED", 400, `${field} կարող է պարունակել միայն տառեր`);
  }
  return name;
}

export function intOf(value: unknown, field: string, min: number, max: number): number {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(number) || number < min || number > max) {
    throw new AppError("VALIDATION_FAILED", 400, `${field} սխալ է`);
  }
  return number;
}

export function optionalString(value: unknown, maxLength?: number): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (maxLength !== undefined && text.length > maxLength) {
    throw new AppError("VALIDATION_FAILED", 400, "Տեքստը չափազանց երկար է");
  }
  return text;
}

export function recordOf(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("VALIDATION_FAILED", 400, "Մարմինը սխալ է");
  }
  return value as Record<string, unknown>;
}
