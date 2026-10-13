import { AppError } from "../common/app-error";
import { optionalString, recordOf, requiredString } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";

export const MAIN_BRANCH_NAME = "Հիմնական";

/** Renames a branch that belongs to this clinic. */
export async function updateBranch(
  prisma: PrismaService,
  clinicId: string,
  branchId: string,
  body: unknown,
): Promise<{ id: string }> {
  const branch = await ownedBranch(prisma, clinicId, branchId);
  const input = recordOf(body);
  const name = capped(requiredString(input.name, "Մասնաճյուղ"), 80);
  if (name === MAIN_BRANCH_NAME && branch.name !== MAIN_BRANCH_NAME) {
    throw new AppError("VALIDATION_FAILED", 400, "Այս անունը վերապահված է գլխավոր հասցեի համար");
  }
  await prisma.branch.update({
    where: { id: branch.id },
    data: {
      name,
      address: capped(optionalString(input.address), 160),
    },
  });
  return { id: branch.id };
}

/** Removes an extra branch. The main location stays on the clinic profile. */
export async function deleteBranch(prisma: PrismaService, clinicId: string, branchId: string): Promise<{ id: string }> {
  const branch = await ownedBranch(prisma, clinicId, branchId);
  if (branch.name === MAIN_BRANCH_NAME) {
    throw new AppError("CONFLICT", 409, "Հիմնական մասնաճյուղը չի ջնջվում");
  }
  const count = await prisma.branch.count({ where: { clinicId } });
  if (count <= 1) throw new AppError("CONFLICT", 409, "Վերջին մասնաճյուղը չի ջնջվում");
  await prisma.branch.delete({ where: { id: branch.id } });
  return { id: branch.id };
}

async function ownedBranch(
  prisma: PrismaService,
  clinicId: string,
  branchId: string,
): Promise<{ id: string; name: string }> {
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, clinicId },
    select: { id: true, name: true },
  });
  if (!branch) throw new AppError("NOT_FOUND", 404, "Մասնաճյուղը չի գտնվել");
  return branch;
}

function capped(text: string, max: number): string {
  if (text.length > max) throw new AppError("VALIDATION_FAILED", 400, "Տեքստը չափազանց երկար է");
  return text;
}
