import type { routing } from "./i18n/routing";
import type messages from "../messages/hy.json";

declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
