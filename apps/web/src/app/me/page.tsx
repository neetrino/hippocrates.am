import { cookies } from "next/headers";

type Me = { role: string; displayName: string; clinicId: string | null };
type Appointment = { id: string; startsAt: string; status: string; priceAmd: number };

async function load<T>(path: string): Promise<T | null> {
  const jar = await cookies();
  const response = await fetch(`${process.env.API_URL}/api/v1${path}`, {
    headers: { cookie: jar.toString() },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const body = (await response.json()) as { data: T };
  return body.data;
}

export default async function MePage() {
  const me = await load<Me>("/auth/me");
  const appointments = me ? await load<Appointment[]>("/appointments/mine") : null;
  if (!me) return <p>Մուտք գործեք՝ ձեր էջը տեսնելու համար։</p>;
  return (
    <section className="grid">
      <h1>{me.displayName}</h1>
      <p className="muted">{me.role}</p>
      {me.role === "SUPER_ADMIN" ? <a href="/platform">Գրանցել կլինիկա</a> : null}
      {me.role === "ADMIN" ? <a href="/clinic">Կլինիկայի վահանակ</a> : null}
      {(appointments ?? []).map((item) => (
        <article className="card" key={item.id}>
          <p>{new Date(item.startsAt).toLocaleString("hy-AM")}</p>
          <p>{item.status} · {item.priceAmd} դրամ</p>
        </article>
      ))}
    </section>
  );
}
