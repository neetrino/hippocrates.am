import { Link } from "@/i18n/navigation";
import type { QuestionCard } from "@/shared/public-types";
import { HomeBanner, HomeDisplayTitle } from "@/features/home/home-banner";

export function HomeQuestions({
  title,
  lede,
  actionLabel,
  questions,
}: {
  title: string;
  lede: string;
  actionLabel: string;
  questions: QuestionCard[];
}) {
  if (questions.length === 0) return null;

  return (
    <section className="page-shell pt-16 max-md:pt-10 md:pt-20">
      <div className="grid overflow-hidden rounded-card bg-surface shadow-soft md:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
        <HomeBanner
          src="/home/home-questions.jpg"
          overlay="bottom"
          sizes="(max-width: 768px) 100vw, 32rem"
          flush
          className="h-full min-h-80"
        >
          <div className="flex min-h-80 flex-col justify-end gap-4 p-7 text-white md:h-full md:p-9">
            <HomeDisplayTitle className="text-[clamp(2rem,3vw,2.8rem)] text-white">{title}</HomeDisplayTitle>
            <p className="m-0 max-w-[22rem] text-white/82">{lede}</p>
            <Link href="/questions" className="btn btn-primary mt-1 w-fit">
              {actionLabel}
            </Link>
          </div>
        </HomeBanner>
        <div className="grid content-center">
          {questions.slice(0, 3).map((question) => (
            <article key={question.id} className="grid gap-1.5 border-b border-line px-5 py-5 last:border-b-0 md:px-7">
              <p className="kicker">{question.category}</p>
              <h3>{question.title}</h3>
              <p className="m-0 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{question.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
