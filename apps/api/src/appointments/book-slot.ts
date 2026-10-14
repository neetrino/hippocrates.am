import { AppError } from "../common/app-error";
import { Prisma, type AppointmentStatus } from "../generated/prisma/client";
import type { PrismaService } from "../infrastructure/prisma.service";

type SlotClient = Pick<PrismaService, "$transaction">;

const openStatuses = ["REQUESTED", "CONFIRMED"] as AppointmentStatus[];

/** Holds one open interval for a doctor. A lost race becomes an unavailable slot. */
export async function withOpenSlot<T>(
  prisma: SlotClient,
  doctorId: string,
  startsAt: Date,
  endsAt: Date,
  ignoreId: string | undefined,
  write: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const clash = await tx.appointment.findFirst({
          where: {
            doctorId,
            id: ignoreId ? { not: ignoreId } : undefined,
            status: { in: openStatuses },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
          select: { id: true },
        });
        if (clash) throw new AppError("SLOT_UNAVAILABLE", 409, "Այդ ժամը ազատ չէ");
        return write(tx);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (isSlotRace(error)) throw new AppError("SLOT_UNAVAILABLE", 409, "Այդ ժամը ազատ չէ");
    throw error;
  }
}

function isSlotRace(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2002" || error.code === "P2034";
  }
  const text = error instanceof Error ? error.message : "";
  return text.includes("23P01") || text.includes("Appointment_no_overlap");
}
