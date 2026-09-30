import { cookies } from "next/headers";

type Envelope<T> = { data: T };

export async function sessionGet<T>(path: string): Promise<T | null> {
  const jar = await cookies();
  const response = await fetch(`${process.env.API_URL}/api/v1${path}`, {
    headers: { cookie: jar.toString() },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = (await response.json()) as Envelope<T>;
  return body.data;
}
