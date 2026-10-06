import { getTranslations } from "next-intl/server";
import { prepareLocale } from "@/i18n/locale";
import { HomeCatalog } from "@/features/home/home-catalog";
import { HomeCta } from "@/features/home/home-cta";
import { HomeHero } from "@/features/home/home-hero";
import { HomeHow } from "@/features/home/home-how";
import { HomeQuestions } from "@/features/home/home-questions";
import { HomeTrust } from "@/features/home/home-trust";
import { publicGet } from "@/shared/public-api";
import type { ClinicCard, DoctorCard, QuestionCard } from "@/shared/public-types";
import { PageFrame } from "@/shared/ui/page-frame";

type HomeData = { clinics: ClinicCard[]; doctors: DoctorCard[] };

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = prepareLocale(raw);
  const t = await getTranslations("home");
  const nav = await getTranslations("nav");
  const common = await getTranslations("common");
  const questionsCopy = await getTranslations("questions");
  const [data, questions] = await Promise.all([
    publicGet<HomeData>("/public/home", locale),
    publicGet<QuestionCard[]>("/questions").catch(() => [] as QuestionCard[]),
  ]);

  return (
    <PageFrame className="pb-6">
      <HomeHero
        locale={locale}
        title={t("title")}
        lede={t("lede")}
        eyebrow={t("eyebrow")}
        placeholder={t("clinicPlaceholder")}
        searchLabel={common("search")}
        doctorsLabel={t("allDoctors")}
        clinics={data.clinics}
      />
      <HomeTrust
        items={[
          { title: t("trust1Title"), body: t("trust1Body") },
          { title: t("trust2Title"), body: t("trust2Body") },
          { title: t("trust3Title"), body: t("trust3Body") },
        ]}
      />
      <HomeCatalog
        clinicsTitle={nav("clinics")}
        doctorsTitle={nav("doctors")}
        seeAll={common("seeAll")}
        emptyClinics={t("emptyClinics")}
        emptyDoctors={t("emptyDoctors")}
        clinics={data.clinics.slice(0, 6)}
        doctors={data.doctors.slice(0, 6)}
      />
      <HomeHow
        title={t("howTitle")}
        steps={[
          { title: t("how1Title"), body: t("how1Body") },
          { title: t("how2Title"), body: t("how2Body") },
          { title: t("how3Title"), body: t("how3Body") },
        ]}
      />
      <HomeQuestions
        title={t("questionsTitle")}
        lede={t("questionsLede")}
        actionLabel={questionsCopy("title")}
        questions={questions}
      />
      <HomeCta
        title={t("ctaTitle")}
        body={t("ctaBody")}
        clinicsLabel={t("ctaClinics")}
        doctorsLabel={t("ctaDoctors")}
      />
    </PageFrame>
  );
}
