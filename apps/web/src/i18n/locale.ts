import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "./routing";

export function prepareLocale(value: string): AppLocale {
  if (!hasLocale(routing.locales, value)) notFound();
  setRequestLocale(value);
  return value;
}
