import type { ResetLocale } from "./password-link";

export type VerifyLocale = ResetLocale;

export function verificationLink(token: string, locale: VerifyLocale): string {
  const origin = (process.env.WEB_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const prefix = locale === "hy" ? "" : `/${locale}`;
  return `${origin}${prefix}/verify-email?token=${encodeURIComponent(token)}`;
}
