import { Logger } from "@nestjs/common";
import type { Request } from "express";
import { AppError } from "../common/app-error";
import { readUploadedImage } from "../identity/user-photo";
import type { PrismaService } from "../infrastructure/prisma.service";
import { deleteObject, publicAssetUrl, uploadAvatar } from "../infrastructure/r2.storage";

type Portrait = { id: string; photoKey: string | null };

async function portrait(prisma: PrismaService, clinicId: string, doctorId: string): Promise<Portrait> {
  const doctor = await prisma.doctorProfile.findFirst({
    where: { id: doctorId, clinicId },
    select: { id: true, photoKey: true },
  });
  if (!doctor) throw new AppError("NOT_FOUND", 404, "Բժիշկը չի գտնվել");
  return doctor;
}

/** Stores the public doctor portrait and drops the previous file. */
export async function saveDoctorPhoto(
  prisma: PrismaService,
  clinicId: string,
  doctorId: string,
  request: Request,
): Promise<string> {
  const doctor = await portrait(prisma, clinicId, doctorId);
  const key = await storedPortrait(doctor.id, request);
  await prisma.doctorProfile.update({ where: { id: doctor.id }, data: { photoKey: key } });
  await removeQuiet(doctor.photoKey);
  return urlOf(key);
}

/** Clears the public doctor portrait. */
export async function clearDoctorPhoto(prisma: PrismaService, clinicId: string, doctorId: string): Promise<void> {
  const doctor = await portrait(prisma, clinicId, doctorId);
  await removeQuiet(doctor.photoKey);
  await prisma.doctorProfile.update({ where: { id: doctor.id }, data: { photoKey: null } });
}

async function storedPortrait(doctorId: string, request: Request): Promise<string> {
  const source = await readUploadedImage(request);
  try {
    return await uploadAvatar(`doctors/${doctorId}/portrait-${Date.now()}.webp`, source);
  } catch {
    throw new AppError("VALIDATION_FAILED", 400, "Նկարը չի կարդացվում");
  }
}

function urlOf(key: string): string {
  const photoUrl = publicAssetUrl(key);
  if (!photoUrl) throw new AppError("INTERNAL", 500, "Ներքին սխալ");
  return photoUrl;
}

async function removeQuiet(key: string | null): Promise<void> {
  if (!key) return;
  try {
    await deleteObject(key);
  } catch (error) {
    Logger.error("Doctor photo delete failed", error instanceof Error ? error.stack : undefined, "DoctorPhoto");
  }
}
