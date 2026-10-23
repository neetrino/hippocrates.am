type AuthCopy = (key: "invalidLogin" | "emailTaken" | "rateLimited") => string;

/** Maps an auth error code to the sentence the form should show. */
export function authFailure(code: string | undefined, t: AuthCopy, fallback: string): string {
  if (code === "INVALID_LOGIN") return t("invalidLogin");
  if (code === "EMAIL_TAKEN") return t("emailTaken");
  if (code === "RATE_LIMITED") return t("rateLimited");
  return fallback;
}
