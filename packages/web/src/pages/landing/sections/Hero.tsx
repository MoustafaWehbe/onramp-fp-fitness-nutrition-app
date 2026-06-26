import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { ROUTES } from "../../../constants/routes";
import { HERO_STATS } from "../landing.data";

export const Hero = () => (
  <section className="relative overflow-hidden bg-ink text-white">
    <div className="absolute inset-0 opacity-20">
      <div className="absolute -right-20 top-0 h-full w-1/2 -skew-x-12 bg-primary/30" />
      <div className="absolute -right-10 top-0 h-full w-1/3 -skew-x-12 bg-primary/20" />
    </div>

    <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
      <div className="animate-fade-up">
        <p className="eyebrow flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" /> Your AI fitness coach
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
          Train with
          <span className="block text-primary">a coach</span>
          that knows you
        </h1>
        <p className="mt-6 max-w-md text-lg text-white/70">
          Skip the generic plan apps. Pick a ready-made program, log what you
          really do, and let an AI that sees your full history coach every meal
          and workout.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to={ROUTES.register}
            className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-heading text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-brand-green-dark"
          >
            Start free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to={ROUTES.programs}
            className="inline-flex items-center gap-2 border border-white/30 px-7 py-3.5 font-heading text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:border-primary hover:text-primary"
          >
            Browse programs
          </Link>
        </div>

        <div className="mt-12 flex gap-8 border-t border-white/10 pt-8">
          {HERO_STATS.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl text-primary">
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wide text-white/50">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative animate-fade-in">
        <div className="clip-slant overflow-hidden border-4 border-primary">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1000&q=80"
            alt="Athlete training"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </div>
    </div>
  </section>
);
