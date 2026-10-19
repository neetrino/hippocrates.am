import { redirect } from "@/i18n/navigation";
import { prepareLocale } from "@/i18n/locale";

export default async function QuestionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  redirect({ href: "/", locale });
}
