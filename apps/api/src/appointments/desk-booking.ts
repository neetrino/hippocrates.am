import { AppError } from "../common/app-error";
import { displayNameOf, recordOf, requiredPhoneOf } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";
import { appointmentNotice, type NotificationsService } from "../notifications/notifications.service";
import { withOpenSlot } from "./book-slot";
import { allowedStarts, clinicDate, instantOf, loadOffering } from "./visit-access";

type Notices = NotificationsService;

/** Books an agreed phone visit. One matching account is linked; otherwise the name and phone are kept. */
export async function bookDeskVisit(prisma: PrismaService, notices: Notices, clinicId: string, body: unknown) {
  const input = recordOf(body);
  const name = displayNameOf(input.name);
  const phone = requiredPhoneOf(input.phone);
  const startsAt = instantOf(input.startsAt);
  const offering = await loadOffering(prisma, requiredStringId(input.offeringId));
  if (offering.clinicId !== clinicId) throw new AppError("NOT_FOUND", 404, "Ծառայությունը չի գտնվել");
  await assertOpen(prisma, notices, offering, startsAt);
  const patientId = await onePatient(prisma, phone);
  const endsAt = new Date(startsAt.getTime() + offering.durationMinutes * 60_000);
  const created = await withOpenSlot(prisma, offering.doctorId, startsAt, endsAt, undefined, (tx) =>
    tx.appointment.create({
      data: {
        patientId,
        guestName: patientId ? null : name,
        guestPhone: patientId ? null : phone,
        doctorId: offering.doctorId,
        clinicId: offering.clinicId,
        offeringId: offering.id,
        startsAt,
        endsAt,
        priceAmd: offering.priceAmd,
        isEstimate: offering.isEstimate,
        status: "CONFIRMED",
        proposedBy: "STAFF",
      },
    }),
  );
  await notices.afterAppointment(created, appointmentNotice.deskBooked);
  return { id: created.id };
}

function requiredStringId(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") throw new AppError("VALIDATION_FAILED", 400, "Ծառայություն պարտադիր է");
  return value.trim();
}

async function onePatient(prisma: PrismaService, phone: string): Promise<string | null> {
  const matches = await prisma.user.findMany({ where: { phone, role: "PATIENT" }, select: { id: true }, take: 2 });
  return matches.length === 1 && matches[0] ? matches[0].id : null;
}

async function assertOpen(
  prisma: PrismaService,
  notices: Notices,
  offering: Awaited<ReturnType<typeof loadOffering>>,
  startsAt: Date,
) {
  const allowed = await allowedStarts(prisma, notices, offering, clinicDate(startsAt, offering.clinic.timeZone));
  if (!allowed.some((start) => start.getTime() === startsAt.getTime())) {
    throw new AppError("SLOT_UNAVAILABLE", 409, "Այդ ժամը ազատ չէ");
  }
}
