import { AppError } from "./app-error";

export function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new AppError("VALIDATION_FAILED", 400, `${field} պարտադիր է`);
  }
  return value.trim();
}

export function emailOf(value: unknown): string {
  const email = requiredString(value, "Էլ. փոստ").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AppError("VALIDATION_FAILED", 400, "Էլ. փոստը սխալ է");
  }
  return email;
}

export function passwordOf(value: unknown): string {
  const password = requiredString(value, "Գաղտնաբառ");
  if (password.length < 8) {
    throw new AppError("VALIDATION_FAILED", 400, "Գաղտնաբառը առնվազն 8 նիշ է");
  }
  return password;
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

export function optionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function recordOf(value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new AppError("VALIDATION_FAILED", 400, "Մարմինը սխալ է");
  }
  return value as Record<string, unknown>;
}
