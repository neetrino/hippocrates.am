const COMMON_PASSWORDS = new Set(["password", "12345678", "qwerty123"]);

/** Client-side mirror of the API rule for a newly chosen password. */
export function passwordIssue(password: string, email?: string): "weak" | "email" | null {
  const acceptable =
    password.length >= 8 &&
    password.length <= 128 &&
    /[\p{L}]/u.test(password) &&
    /\d/.test(password) &&
    !COMMON_PASSWORDS.has(password.toLowerCase());
  if (!acceptable) return "weak";
  if (email && password.toLowerCase() === email.trim().toLowerCase()) return "email";
  return null;
}
