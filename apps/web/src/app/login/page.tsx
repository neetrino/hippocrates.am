import { JsonForm } from "@/shared/json-form";

export default function LoginPage() {
  return (
    <section className="auth-wrap panel">
      <h1>Մուտք</h1>
      <JsonForm
        action="/auth/login"
        label="Մտնել"
        next="/me"
        fields={[
          { name: "email", label: "Էլ. փոստ", type: "email" },
          { name: "password", label: "Գաղտնաբառ", type: "password" },
        ]}
      />
    </section>
  );
}
