import { Link } from "@/i18n/navigation";

type Crumb = {
  href?: "/" | "/clinics" | "/doctors" | "/questions";
  label: string;
};

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem] text-muted">
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {item.href && !last ? (
              <Link href={item.href} className="transition-colors duration-160 hover:text-accent">
                {item.label}
              </Link>
            ) : (
              <span className="text-ink" aria-current={last ? "page" : undefined}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
