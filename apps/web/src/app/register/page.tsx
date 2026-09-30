import { JsonForm } from "@/shared/json-form";

export default function RegisterPage() {
  return (
    <section>
      <h1>Պացիենտի գրանցում</h1>
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
