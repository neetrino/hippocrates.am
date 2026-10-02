/** Public site origin for metadata, Open Graph, and absolute share URLs. */
export function getSiteUrl(): URL {
  const configured = process.env.WEB_URL?.trim();
  if (configured) return new URL(configured);
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}
