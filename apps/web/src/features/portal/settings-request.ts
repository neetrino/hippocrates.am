type ErrorBody = { error?: { message?: string } };

/** Authenticated account request. Returns the API message when the call fails. */
export async function accountRequest(path: string, init: RequestInit): Promise<{ ok: true } | { ok: false; message: string }> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const response = await fetch(`${base}/api/v1${path}`, { ...init, credentials: "include" });
  if (response.ok) return { ok: true };
  let message = "";
  try {
    const body = (await response.json()) as ErrorBody;
    message = body.error?.message ?? "";
  } catch {
    message = "";
  }
  return { ok: false, message };
}
