/** Keeps the post-login path inside this site. */
export function returnPath(value: string | null): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) return null;
  return value;
}

/** Favorite the visitor tried to save before signing in. */
export function favoriteTarget(value: string | null): string | null {
  const match = /^(clinic|doctor):([a-z0-9]+)$/i.exec(value ?? "");
  if (!match?.[1] || !match[2]) return null;
  const kind = match[1].toLowerCase() === "clinic" ? "clinics" : "doctors";
  return `/favorites/${kind}/${match[2]}`;
}
