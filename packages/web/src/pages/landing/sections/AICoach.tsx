import { Link } from "react-router-dom";
import { ArrowRight, Database, MessageSquareText, Sparkles } from "lucide-react";
import { LANDING_SECTIONS, ROUTES } from "../../../constants/routes";
import { COACH_QUESTIONS } from "../landing.data";

export const AICoach = () => (
  <section
    id={LANDING_SECTIONS.coach.replace("#", "")}
    className="bg-ink py-24 text-white"
  >
    <div className="mx-auto grid w-full max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="eyebrow text-primary">The difference</p>
        <h2 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
          An AI coach with your
          <span className="text-primary"> full context</span>
        </h2>
        <p className="mt-6 max-w-md text-white/70">
          Because it sees both your plan and everything you have logged, the
          assistant answers from PostgreSQL-backed program, meal, workout,
          measurement, and chat history.
        </p>

        <ul className="mt-8 space-y-3">
          {COACH_QUESTIONS.map((q) => (
            <li
              key={q}
              className="flex items-center gap-3 border border-white/10 bg-ink-800 px-4 py-3 text-sm"
            >
              <MessageSquareText className="h-4 w-4 shrink-0 text-primary" />
              <span>"{q}"</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="clip-slant-tl border border-white/10 bg-ink-800 p-6">
        <div className="flex items-center gap-3 border border-white/10 bg-ink p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary text-ink">
            <Database className="h-5 w-5" />
          </span>
          <div>
            <p className="font-heading text-sm font-semibold uppercase tracking-wide">
              Live context only
            </p>
            <p className="mt-1 text-sm text-white/60">
              The assistant panel appears after sign in and only renders real
              OpenRouter/API responses or clear provider errors.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {["Active program", "Meal logs", "Workout logs", "Measurements"].map(
            (item) => (
              <div
                key={item}
                className="flex items-center gap-2 border border-white/10 px-3 py-3 text-sm text-white/70"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                {item}
              </div>
            ),
          )}
        </div>

        <Link
          to={ROUTES.login}
          className="mt-6 inline-flex items-center gap-2 bg-primary px-5 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-brand-green-dark"
        >
          Open AI assistant
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);
