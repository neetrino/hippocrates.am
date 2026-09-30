import { publicGet } from "@/shared/public-api";

type QuestionCard = {
  id: string;
  title: string;
  body: string;
  answers: { id: string; body: string; doctor: { user: { displayName: string } } }[];
};

export default async function QuestionsPage() {
  const questions = await publicGet<QuestionCard[]>("/questions");
  return (
    <section className="grid">
      <h1>Հանրային հարցեր</h1>
      {questions.map((question) => (
        <article className="card" key={question.id}>
          <h2>{question.title}</h2>
          <p>{question.body}</p>
          {question.answers.map((answer) => (
            <p key={answer.id}>
              {answer.doctor.user.displayName}: {answer.body}
            </p>
          ))}
        </article>
      ))}
    </section>
  );
}
