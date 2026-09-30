import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell bar">
        <Link href="/" className="brand">
          <span className="mark" aria-hidden="true" />
          Hippocrates
        </Link>
        <nav className="nav">
          <Link href="/clinics">Կլինիկաներ</Link>
          <Link href="/doctors">Բժիշկներ</Link>
          <Link href="/questions">Հարցեր</Link>
        </nav>
        <div className="nav-actions">
          <Link href="/login">Մուտք</Link>
          <Link href="/me">Իմ էջը</Link>
          <Link href="/register" className="btn btn-small">Գրանցում</Link>
        </div>
      </div>
    </header>
  );
}
