import { JsonForm } from "@/shared/json-form";

export default function PlatformPage() {
  return (
    <section>
      <h1>Կլինիկայի գրանցում</h1>
      <p className="muted">Super Admin-ը գրանցում է կլինիկան, իսկ տերը դառնում է Admin։</p>
      <JsonForm
        action="/clinics"
        label="Գրանցել կլինիկա"
        next="/me"
        fields={[
          { name: "name", label: "Կլինիկայի անուն" },
          { name: "address", label: "Հասցե" },
          { name: "phone", label: "Հեռախոս" },
          { name: "adminName", label: "Ադմինի անուն" },
          { name: "adminEmail", label: "Ադմինի էլ. փոստ", type: "email" },
          { name: "adminPassword", label: "Ադմինի գաղտնաբառ", type: "password" },
        ]}
      />
    </section>
  );
}
