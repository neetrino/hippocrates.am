export type ApiResult<T> = { data: T };

const apiUrl = (): string => process.env.API_URL ?? "http://localhost:4000";

export async function publicGet<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl()}/api/v1${path}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Հարցումը չհաջողվեց");
  const body = (await response.json()) as ApiResult<T>;
  return body.data;
}
