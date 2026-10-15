export type ResetLocale = "hy" | "en" | "ru";

export function resetLocale(value: unknown): ResetLocale {
  return value === "en" || value === "ru" ? value : "hy";
}

export function resetLink(token: string, locale: ResetLocale): string {
  const origin = (process.env.WEB_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const prefix = locale === "hy" ? "" : `/${locale}`;
  return `${origin}${prefix}/reset-password?token=${encodeURIComponent(token)}`;
}
