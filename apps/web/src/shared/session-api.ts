import { cache } from "react";
import { cookies } from "next/headers";
import type { Me } from "@/shared/public-types";

type Envelope<T> = { data: T };

/** One `/auth/me` read per request, shared by the header and layout. */
export const getMe = cache((): Promise<Me | null> => sessionGet<Me>("/auth/me"));

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
