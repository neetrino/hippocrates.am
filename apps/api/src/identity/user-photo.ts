import { Logger } from "@nestjs/common";
import type { Request } from "express";
import { AppError } from "../common/app-error";
import { deleteObject, publicAssetUrl, uploadAvatar } from "../infrastructure/r2.storage";
import type { PrismaService } from "../infrastructure/prisma.service";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function assertPhotoType(request: Request): void {
  const raw = (request.header("content-type") ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
  const type = raw === "image/jpg" ? "image/jpeg" : raw;
  if (!PHOTO_TYPES.has(type)) {
    throw new AppError("VALIDATION_FAILED", 400, "Ընտրեք JPG, PNG կամ WebP նկար");
  }
}

async function readLimited(request: Request): Promise<Buffer> {
  const declared = Number(request.header("content-length") ?? 0);
  if (declared > MAX_PHOTO_BYTES) {
    throw new AppError("VALIDATION_FAILED", 400, "Նկարը չափից մեծ է");
  }
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const piece = typeof chunk === "string" ? Buffer.from(chunk) : Buffer.from(chunk);
    size += piece.length;
    if (size > MAX_PHOTO_BYTES) {
      throw new AppError("VALIDATION_FAILED", 400, "Նկարը չափից մեծ է");
    }
    chunks.push(piece);
  }
  if (size === 0) throw new AppError("VALIDATION_FAILED", 400, "Նկարը դատարկ է");
  return Buffer.concat(chunks);
}

/** Stores the current user's photo and returns its public URL. */
export async function saveUserPhoto(prisma: PrismaService, userId: string, request: Request): Promise<string> {
  assertPhotoType(request);
  const source = await readLimited(request);
  let key: string;
  try {
    key = await uploadAvatar(`users/${userId}/avatar-${Date.now()}.webp`, source);
  } catch {
    throw new AppError("VALIDATION_FAILED", 400, "Նկարը չի կարդացվում");
  }
  await prisma.user.update({ where: { id: userId }, data: { photoKey: key } });
  const photoUrl = publicAssetUrl(key);
  if (!photoUrl) throw new AppError("INTERNAL", 500, "Ներքին սխալ");
  return photoUrl;
}

/** Clears the current user's photo. The profile updates even if the file is already gone. */
export async function clearUserPhoto(prisma: PrismaService, userId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { photoKey: true } });
  if (!user) throw new AppError("UNAUTHENTICATED", 401, "Մուտք գործեք");
  if (user.photoKey) {
    try {
      await deleteObject(user.photoKey);
    } catch (error) {
      Logger.error("Photo delete failed", error instanceof Error ? error.stack : undefined, "UserPhoto");
    }
  }
  await prisma.user.update({ where: { id: userId }, data: { photoKey: null } });
}
