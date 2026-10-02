import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { readFile } from "node:fs/promises";

type R2Config = {
  client: S3Client;
  bucket: string;
};

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim() ?? "";
  if (!value) throw new Error(`${name} is required`);
  return value;
}

/** Public object URL. Returns null when the key or base URL is missing. */
export function publicAssetUrl(key: string | null | undefined): string | null {
  const base = process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, "");
  if (!key || !base) return null;
  return `${base}/${key}`;
}

function r2Config(): R2Config {
  requiredEnv("R2_PUBLIC_URL");
  return {
    client: new S3Client({
      region: "auto",
      endpoint: requiredEnv("R2_ENDPOINT"),
      credentials: {
        accessKeyId: requiredEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requiredEnv("R2_SECRET_ACCESS_KEY"),
      },
    }),
    bucket: requiredEnv("R2_BUCKET"),
  };
}

/**
 * Converts a local image to WebP and stores it in R2.
 * The returned key is appended to R2_PUBLIC_URL for public pages.
 */
export async function uploadImage(key: string, sourcePath: string): Promise<string> {
  const config = r2Config();
  const source = await readFile(sourcePath);
  const { default: sharp } = await import("sharp");
  const body = await sharp(source).webp({ quality: 82 }).toBuffer();
  await config.client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: "image/webp",
    }),
  );
  return key;
}
