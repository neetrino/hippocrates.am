import { JsonForm } from "@/shared/json-form";

export default function RegisterPage() {
  return (
    <section className="auth-wrap panel">
      <h1>Գրանցում</h1>
      <p className="muted">Պացիենտի հաշիվը բացվում է այստեղից։</p>
      <JsonForm
        action="/auth/register"
        label="Գրանցվել"
        next="/"
        fields={[
          { name: "displayName", label: "Անուն" },
          { name: "email", label: "Էլ. փոստ", type: "email" },
          { name: "password", label: "Գաղտնաբառ", type: "password" },
        ]}
      />
    </section>
  );
}
