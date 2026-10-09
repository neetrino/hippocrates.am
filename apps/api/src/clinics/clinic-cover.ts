import { Logger } from "@nestjs/common";
import type { Request } from "express";
import { AppError } from "../common/app-error";
import { readUploadedImage } from "../identity/user-photo";
import type { PrismaService } from "../infrastructure/prisma.service";
import { deleteObject, publicAssetUrl, uploadCover } from "../infrastructure/r2.storage";

type Cover = { id: string; coverKey: string | null };

async function coverOf(prisma: PrismaService, clinicId: string): Promise<Cover> {
  const clinic = await prisma.clinic.findUnique({ where: { id: clinicId }, select: { id: true, coverKey: true } });
  if (!clinic) throw new AppError("NOT_FOUND", 404, "Կլինիկան չի գտնվել");
  return clinic;
}

/** Stores a new clinic cover and drops the previous file. */
export async function saveClinicCover(prisma: PrismaService, clinicId: string, request: Request): Promise<string> {
  const clinic = await coverOf(prisma, clinicId);
  const key = await storedCover(clinic.id, request);
  await prisma.clinic.update({ where: { id: clinic.id }, data: { coverKey: key } });
  await removeQuiet(clinic.coverKey);
  return urlOf(key);
}

/** Clears the clinic cover. */
export async function clearClinicCover(prisma: PrismaService, clinicId: string): Promise<void> {
  const clinic = await coverOf(prisma, clinicId);
  await removeQuiet(clinic.coverKey);
  await prisma.clinic.update({ where: { id: clinic.id }, data: { coverKey: null } });
}

async function storedCover(clinicId: string, request: Request): Promise<string> {
  const source = await readUploadedImage(request);
  try {
    return await uploadCover(`clinics/${clinicId}/cover-${Date.now()}.webp`, source);
  } catch {
    throw new AppError("VALIDATION_FAILED", 400, "Նկարը չի կարդացվում");
  }
}

function urlOf(key: string): string {
  const coverUrl = publicAssetUrl(key);
  if (!coverUrl) throw new AppError("INTERNAL", 500, "Ներքին սխալ");
  return coverUrl;
}

async function removeQuiet(key: string | null): Promise<void> {
  if (!key) return;
  try {
    await deleteObject(key);
  } catch (error) {
    Logger.error("Cover delete failed", error instanceof Error ? error.stack : undefined, "ClinicCover");
  }
}
