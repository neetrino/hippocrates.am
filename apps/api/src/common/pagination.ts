import { AppError } from "./app-error";

export const LIST_PAGE_SIZE = 50;
const MAX_PAGE = 10_000;

export function pageWindow(raw: string | undefined): { page: number; skip: number; take: number } {
  if (raw === undefined || raw === "") return { page: 1, skip: 0, take: LIST_PAGE_SIZE };
  if (!/^[1-9]\d*$/.test(raw)) throw invalidPage();
  const page = Number(raw);
  if (!Number.isSafeInteger(page) || page > MAX_PAGE) throw invalidPage();
  return { page, skip: (page - 1) * LIST_PAGE_SIZE, take: LIST_PAGE_SIZE };
}

function invalidPage(): AppError {
  return new AppError("VALIDATION_FAILED", 400, "Էջը սխալ է");
}
