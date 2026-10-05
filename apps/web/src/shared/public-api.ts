export type ApiResult<T> = { data: T };

const apiUrl = (): string => process.env.API_URL ?? "http://localhost:4000";

export async function publicGet<T>(path: string, locale?: string): Promise<T> {
  const localized =
    locale && locale !== "hy" ? `${path}${path.includes("?") ? "&" : "?"}locale=${encodeURIComponent(locale)}` : path;
  const response = await fetch(`${apiUrl()}/api/v1${localized}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Հարցումը չհաջողվեց");
  const body = (await response.json()) as ApiResult<T>;
  return body.data;
}
