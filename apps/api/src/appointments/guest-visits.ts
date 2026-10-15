import { pageWindow } from "../common/pagination";
import type { PrismaService } from "../infrastructure/prisma.service";

export type DeskPatient = {
  id: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
};

export async function listClinicPatients(
  prisma: PrismaService,
  clinicId: string,
  page?: string,
): Promise<DeskPatient[]> {
  const { skip, take } = pageWindow(page);
  return prisma.$queryRaw<DeskPatient[]>`
    SELECT combined."id", combined."displayName", combined."email", combined."phone"
    FROM (
      SELECT patients.* FROM (
        SELECT DISTINCT ON (appointment."patientId")
          patient."id", patient."displayName", patient."email", patient."phone",
          appointment."startsAt" AS "lastSeenAt"
        FROM "Appointment" appointment
        JOIN "User" patient ON patient."id" = appointment."patientId"
        WHERE appointment."clinicId" = ${clinicId} AND appointment."patientId" IS NOT NULL
        ORDER BY appointment."patientId", appointment."startsAt" DESC
      ) patients
      UNION ALL
      SELECT guests.* FROM (
        SELECT DISTINCT ON (appointment."guestPhone")
          NULL::text AS "id", COALESCE(appointment."guestName", '') AS "displayName",
          NULL::text AS "email", appointment."guestPhone" AS "phone",
          appointment."startsAt" AS "lastSeenAt"
        FROM "Appointment" appointment
        WHERE appointment."clinicId" = ${clinicId}
          AND appointment."patientId" IS NULL
          AND appointment."guestPhone" IS NOT NULL
        ORDER BY appointment."guestPhone", appointment."startsAt" DESC
      ) guests
    ) combined
    ORDER BY combined."lastSeenAt" DESC
    LIMIT ${take} OFFSET ${skip}
  `;
}

export async function countClinicPatients(prisma: PrismaService, clinicId: string): Promise<number> {
  const rows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT (
      COUNT(DISTINCT "patientId")
      + COUNT(DISTINCT "guestPhone") FILTER (WHERE "patientId" IS NULL)
    )::integer AS "count"
    FROM "Appointment"
    WHERE "clinicId" = ${clinicId}
  `;
  return rows[0]?.count ?? 0;
}

