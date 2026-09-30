"use client";

import { FormEvent, useState } from "react";

async function post(path: string, payload: Record<string, string | number>): Promise<boolean> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.ok;
}

export function ClinicForms() {
  const [message, setMessage] = useState("");

  async function onDoctor(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const clinicId = String(form.get("clinicId") ?? "");
    const ok = await post(`/clinics/${clinicId}/doctors`, {
      displayName: String(form.get("displayName") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      specialty: String(form.get("specialty") ?? ""),
    });
    setMessage(ok ? "Բժիշկը գրանցվեց" : "Չհաջողվեց");
  }

  async function onOffering(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const clinicId = String(form.get("clinicId") ?? "");
    const ok = await post(`/clinics/${clinicId}/offerings`, {
      doctorId: String(form.get("doctorId") ?? ""),
      name: String(form.get("name") ?? ""),
      priceAmd: Number(form.get("priceAmd")),
      durationMinutes: Number(form.get("durationMinutes")),
    });
    setMessage(ok ? "Ծառայությունը պահվեց" : "Չհաջողվեց");
  }

  return (
    <div className="grid">
      <form onSubmit={(event) => void onDoctor(event)}>
        <h2>Բժիշկ</h2>
        <label>Կլինիկայի id<input name="clinicId" required /></label>
        <label>Անուն<input name="displayName" required /></label>
        <label>Էլ. փոստ<input name="email" type="email" required /></label>
        <label>Գաղտնաբառ<input name="password" type="password" required /></label>
        <label>Մասնագիտություն<input name="specialty" required /></label>
        <button type="submit">Գրանցել բժիշկ</button>
      </form>
      <form onSubmit={(event) => void onOffering(event)}>
        <h2>Ծառայություն</h2>
        <label>Կլինիկայի id<input name="clinicId" required /></label>
        <label>Բժշկի id<input name="doctorId" required /></label>
        <label>Անուն<input name="name" required /></label>
        <label>Գին (դրամ)<input name="priceAmd" type="number" required /></label>
        <label>Րոպե<input name="durationMinutes" type="number" required /></label>
        <button type="submit">Ավելացնել</button>
      </form>
      {message ? <p>{message}</p> : null}
    </div>
  );
}
