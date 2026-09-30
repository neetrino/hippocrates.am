"use client";

async function post(path: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
  });
  window.location.reload();
}

export function AppointmentActions(props: { id: string; status: string; mode: "patient" | "admin" }) {
  if (props.status !== "REQUESTED" && props.status !== "CONFIRMED") return null;
  return (
    <div className="actions">
      {props.mode === "admin" && props.status === "REQUESTED" ? (
        <button className="btn btn-small" type="button" onClick={() => void post(`/appointments/${props.id}/confirm`)}>Հաստատել</button>
      ) : null}
      {props.mode === "admin" && props.status === "CONFIRMED" ? (
        <button className="btn btn-small" type="button" onClick={() => void post(`/appointments/${props.id}/complete`)}>Ավարտել</button>
      ) : null}
      <button className="btn btn-small btn-danger" type="button" onClick={() => void post(`/appointments/${props.id}/cancel`)}>Չեղարկել</button>
    </div>
  );
}
