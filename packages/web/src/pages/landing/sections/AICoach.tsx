import { MessageSquareText, Sparkles } from "lucide-react";
import { cn } from "../../../lib/utils";
import { LANDING_SECTIONS } from "../../../constants/routes";
import { COACH_QUESTIONS, COACH_CHAT } from "../landing.data";

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
          Because it sees both your plan and everything you've logged, the
          assistant answers like a real coach who's been watching your week —
          not a chatbot guessing.
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

      <div className="clip-slant-tl space-y-4 border border-white/10 bg-ink-800 p-6">
        {COACH_CHAT.map((msg, i) =>
          msg.from === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] bg-primary px-4 py-2.5 text-sm text-ink">
                {msg.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-primary text-ink">
                <Sparkles className="h-4 w-4" />
              </span>
              <p
                className={cn(
                  "max-w-[85%] border border-white/10 bg-ink px-4 py-2.5 text-sm text-white/80",
                )}
              >
                {msg.text}
              </p>
            </div>
          ),
        )}
      </div>
    </div>
  </section>
);
