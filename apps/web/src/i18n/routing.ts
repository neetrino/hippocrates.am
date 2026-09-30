import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["hy", "en", "ru"],
  defaultLocale: "hy",
  // Always keep the locale in the URL (`/hy`, `/en`, `/ru`) so switches replace
  // the prefix instead of stacking paths like `/hy/ru`.
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
