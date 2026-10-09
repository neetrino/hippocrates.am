const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function clinicSend(path: string, method: "PATCH" | "PUT" | "DELETE", payload?: unknown): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: payload === undefined ? undefined : { "content-type": "application/json" },
    body: payload === undefined ? undefined : JSON.stringify(payload),
  });
  return response.ok;
}

export async function clinicImage(path: string, method: "POST" | "DELETE", file?: File): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: file ? { "content-type": file.type } : undefined,
    body: file,
  });
  return response.ok;
}

export function acceptedImage(file: File): boolean {
  return PHOTO_TYPES.has(file.type) && file.size > 0 && file.size <= MAX_PHOTO_BYTES;
}
