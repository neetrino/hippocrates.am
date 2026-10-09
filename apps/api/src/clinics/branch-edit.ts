import { AppError } from "../common/app-error";
import { optionalString, recordOf, requiredString } from "../common/input";
import type { PrismaService } from "../infrastructure/prisma.service";

/** Renames a branch that belongs to this clinic. */
export async function updateBranch(
  prisma: PrismaService,
  clinicId: string,
  branchId: string,
  body: unknown,
): Promise<{ id: string }> {
  const branch = await ownedBranch(prisma, clinicId, branchId);
  const input = recordOf(body);
  await prisma.branch.update({
    where: { id: branch.id },
    data: {
      name: capped(requiredString(input.name, "Մասնաճյուղ"), 80),
      address: capped(optionalString(input.address), 160),
    },
  });
  return { id: branch.id };
}

/** Removes a branch. Visits are not tied to a branch row. */
export async function deleteBranch(prisma: PrismaService, clinicId: string, branchId: string): Promise<{ id: string }> {
  const branch = await ownedBranch(prisma, clinicId, branchId);
  await prisma.branch.delete({ where: { id: branch.id } });
  return { id: branch.id };
}

async function ownedBranch(prisma: PrismaService, clinicId: string, branchId: string): Promise<{ id: string }> {
  const branch = await prisma.branch.findFirst({ where: { id: branchId, clinicId }, select: { id: true } });
  if (!branch) throw new AppError("NOT_FOUND", 404, "Մասնաճյուղը չի գտնվել");
  return branch;
}

function capped(text: string, max: number): string {
  if (text.length > max) throw new AppError("VALIDATION_FAILED", 400, "Տեքստը չափազանց երկար է");
  return text;
}
