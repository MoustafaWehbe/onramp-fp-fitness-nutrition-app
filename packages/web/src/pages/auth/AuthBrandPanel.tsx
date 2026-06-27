import { Link } from "react-router-dom";
import { ArrowLeft, Check, Dumbbell } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { AUTH_HIGHLIGHTS } from "../../constants/auth";
import { HERO_STATS } from "../landing/landing.data";

export const AuthBrandPanel = () => (
  <aside className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col">
    <div className="absolute inset-0 opacity-20" aria-hidden>
      <div className="absolute -right-24 top-0 h-full w-1/2 -skew-x-12 bg-primary/30" />
      <div className="absolute -right-10 top-0 h-full w-1/3 -skew-x-12 bg-primary/20" />
    </div>

    <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
      <div className="flex items-center justify-between gap-4">
        <Link to={ROUTES.landing} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center bg-primary text-ink">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="font-heading text-lg font-bold uppercase tracking-wider">
            FitCoach<span className="text-primary"> AI</span>
          </span>
        </Link>
        <Link
          to={ROUTES.landing}
          className="inline-flex items-center gap-1.5 font-heading text-xs font-medium uppercase tracking-wide text-white/60 transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back home
        </Link>
      </div>

      <div className="max-w-md">
        <p className="eyebrow text-primary">Your AI fitness coach</p>
        <h2 className="mt-4 font-display text-5xl uppercase leading-[0.95] tracking-tight xl:text-6xl">
          Train with a coach that knows you
        </h2>
        <ul className="mt-8 space-y-4">
          {AUTH_HIGHLIGHTS.map((item) => (
            <li key={item} className="flex items-start gap-3 text-white/80">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center bg-primary text-ink">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex gap-8 border-t border-white/10 pt-8">
        {HERO_STATS.map((s) => (
          <div key={s.label}>
            <div className="font-display text-3xl text-primary">{s.value}</div>
            <div className="text-xs uppercase tracking-wide text-white/50">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  </aside>
);
