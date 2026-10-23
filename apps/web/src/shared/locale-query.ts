/** Appends the page and a non-Armenian catalog locale to an API path. */
export function withLocale(path: string, page: number, locale: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (locale === "en" || locale === "ru") params.set("locale", locale);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
