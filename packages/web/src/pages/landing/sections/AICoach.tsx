import { Link } from "react-router-dom";
import { ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { LANDING_SECTIONS, ROUTES } from "../../../constants/routes";
import { COACH_CONTEXT_ITEMS, COACH_QUESTIONS } from "../landing.data";

export const AICoach = () => (
  <section
    id={LANDING_SECTIONS.coach.replace("#", "")}
    className="bg-background py-16 sm:py-24 lg:py-28"
  >
    <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 sm:gap-14 sm:px-6 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="eyebrow text-muted-foreground">The difference</p>
        <h2 className="mt-3 font-sans text-3xl font-black uppercase leading-[0.95] tracking-tight text-ink sm:text-4xl lg:text-5xl">
          A coach that read
          <span className="block text-brand-green-dark">your whole week</span>
        </h2>
        <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
          Generic advice is easy to find. Advice that accounts for the three
          workouts you skipped is not.
        </p>

        <ul className="mt-8 space-y-3">
          {COACH_QUESTIONS.map((q) => (
            <li
              key={q}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 text-sm text-ink"
            >
              <MessageSquareText
                className="h-4 w-4 shrink-0 text-brand-green-dark"
                aria-hidden
              />
              <span>&ldquo;{q}&rdquo;</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl bg-ink p-6 text-white sm:p-8">
        <p className="eyebrow text-brand-green">What it reads</p>
        <h3 className="mt-3 font-heading text-2xl font-bold uppercase tracking-wide">
          Your plan and your logs
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Nothing invented, and nothing borrowed from somebody else&apos;s
          week.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {COACH_CONTEXT_ITEMS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-4 py-3 text-sm text-white/70"
            >
              <Sparkles
                className="h-4 w-4 shrink-0 text-brand-green"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>

        <Link
          to={ROUTES.register}
          className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white"
        >
          Try it yourself
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  </section>
);
