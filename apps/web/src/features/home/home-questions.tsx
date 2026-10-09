import { Link } from "@/i18n/navigation";
import type { QuestionCard } from "@/shared/public-types";
import { SectionHeader } from "@/shared/ui/section-header";

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
    <section className="grid gap-6 pt-16 max-md:gap-4 max-md:pt-10">
      <SectionHeader
        title={title}
        action={
          <Link href="/questions" className="btn btn-ghost shrink-0">
            {actionLabel}
          </Link>
        }
      />
      <p className="m-0 max-w-[40rem] text-muted">{lede}</p>
      <div className="grid gap-3">
        {questions.slice(0, 3).map((question) => (
          <article key={question.id} className="grid gap-2 rounded-card bg-surface px-5 py-5">
            <p className="kicker">{question.category}</p>
            <h3>{question.title}</h3>
            <p className="m-0 line-clamp-2 text-[0.95rem] leading-relaxed text-muted">{question.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
