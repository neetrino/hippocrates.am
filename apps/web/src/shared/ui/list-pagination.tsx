import { getTranslations } from "next-intl/server";

const PAGE_SIZE = 50;

type QueryValue = string | string[] | undefined;

export async function ListPagination({
  page,
  itemCount,
  query = {},
}: {
  page: number;
  itemCount: number;
  query?: Record<string, QueryValue>;
}) {
  if (page === 1 && itemCount < PAGE_SIZE) return null;
  const common = await getTranslations("common");
  return (
    <nav aria-label={common("pagination")} className="flex items-center justify-center gap-3 pt-4">
      {page > 1 ? (
        <a className="btn btn-secondary" href={pageHref(page - 1, query)}>
          {common("previousPage")}
        </a>
      ) : null}
      <span className="text-sm text-muted">{common("pageNumber", { page })}</span>
      {itemCount === PAGE_SIZE ? (
        <a className="btn btn-secondary" href={pageHref(page + 1, query)}>
          {common("nextPage")}
        </a>
      ) : null}
    </nav>
  );
}

export function listPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value || !/^[1-9]\d*$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page <= 10_000 ? page : 1;
}

function pageHref(page: number, query: Record<string, QueryValue>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) {
      if (item) params.append(key, item);
    }
  }
  if (page > 1) params.set("page", String(page));
  const suffix = params.toString();
  return suffix ? `?${suffix}` : "?";
}
