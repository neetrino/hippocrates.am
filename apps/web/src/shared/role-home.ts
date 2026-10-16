export type AccountHome = "/super-admin" | "/clinic" | "/me";

export function accountHome(role: string): AccountHome {
  if (role === "SUPER_ADMIN") return "/super-admin";
  if (role === "ADMIN") return "/clinic";
  return "/me";
}
