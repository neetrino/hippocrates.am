import { validateRuntimeEnvironment } from "./runtime-environment";

const localEnv: NodeJS.ProcessEnv = {
  DATABASE_URL: "postgresql://local:local@localhost:5432/hippocrates",
  NODE_ENV: "development",
};

const productionEnv: NodeJS.ProcessEnv = {
  ...localEnv,
  NODE_ENV: "production",
  WEB_URL: "https://hippocrates.example",
  RESEND_API_KEY: "test-mail-key",
  MAIL_FROM: "Hippocrates <mail@hippocrates.example>",
  R2_ENDPOINT: "https://storage.example",
  R2_ACCESS_KEY_ID: "test-access-key",
  R2_SECRET_ACCESS_KEY: "test-secret-key",
  R2_BUCKET: "hippocrates",
  R2_PUBLIC_URL: "https://media.hippocrates.example",
};

describe("validateRuntimeEnvironment", () => {
  it("accepts a minimal local environment", () => {
    expect(() => validateRuntimeEnvironment(localEnv)).not.toThrow();
  });

  it("requires a PostgreSQL runtime URL", () => {
    expect(() => validateRuntimeEnvironment({ NODE_ENV: "development" })).toThrow("DATABASE_URL is required");
    expect(() => validateRuntimeEnvironment({ ...localEnv, DATABASE_URL: "https://example.com" })).toThrow(
      "DATABASE_URL must use PostgreSQL",
    );
  });

  it("rejects partial provider configuration", () => {
    expect(() => validateRuntimeEnvironment({ ...localEnv, RESEND_API_KEY: "test-key" })).toThrow(
      "RESEND_API_KEY and MAIL_FROM must be configured together",
    );
    expect(() => validateRuntimeEnvironment({ ...localEnv, R2_BUCKET: "hippocrates" })).toThrow(
      "must be configured together",
    );
  });

  it("requires secure, complete production configuration", () => {
    expect(() => validateRuntimeEnvironment({ ...productionEnv, WEB_URL: "http://hippocrates.example" })).toThrow(
      "WEB_URL must be an HTTPS origin",
    );
    expect(() => validateRuntimeEnvironment(productionEnv)).not.toThrow();
  });
});
