import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Dumbbell, Flame, Zap } from "lucide-react";
import { ROUTES } from "../../../constants/routes";
import { HERO_STATS } from "../landing.data";

export const Hero = () => (
  <section className="relative overflow-hidden bg-neutral-300 text-neutral-900">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute -right-20 top-0 h-full w-1/2 -skew-x-12 bg-neutral-400" />
      <div className="absolute -right-10 top-0 h-full w-1/3 -skew-x-12 bg-neutral-300" />
    </div>

    <div className="relative mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
      <div className="animate-fade-up">
        <p className="eyebrow flex items-center gap-2 text-primary">
          <Sparkles className="h-4 w-4" /> Your AI fitness coach
        </p>
        <h1 className="mt-4 font-display text-6xl uppercase leading-[0.95] tracking-tight text-neutral-900 sm:text-7xl lg:text-8xl">
          Train with
          <span className="block text-primary">a coach</span>
          that knows you
        </h1>
        <p className="mt-6 max-w-md text-lg text-neutral-600">
          Skip the generic plan apps. Pick a ready-made program, log what you
          really do, and let an AI that sees your full history coach every meal
          and workout.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            to={ROUTES.register}
            className="group inline-flex items-center gap-2 bg-primary px-7 py-3.5 font-heading text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-brand-green-dark"
          >
            Start free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            to={ROUTES.programs}
            className="inline-flex items-center gap-2 border border-neutral-500 px-7 py-3.5 font-heading text-sm font-semibold uppercase tracking-wide text-neutral-800 transition-colors hover:border-primary hover:text-primary"
          >
            Browse programs
          </Link>
        </div>

        <div className="mt-12 flex gap-8 border-t border-neutral-400 pt-8">
          {HERO_STATS.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl text-primary">
                {s.value}
              </div>
              <div className="text-xs uppercase tracking-wide text-neutral-500">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="relative animate-fade-in flex items-center justify-center">
        {/* glow behind the mascot */}
        <div className="absolute h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute h-52 w-52 rounded-full bg-primary/10 hero-pulse" />

        {/* floating fitness-icon badges */}
        <span className="hero-float-a absolute left-2 top-8 z-20 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5 sm:left-4 sm:top-12">
          <Dumbbell className="h-6 w-6 text-primary" />
        </span>
        <span className="hero-float-b absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-primary shadow-lg sm:right-8 sm:top-6">
          <Zap className="h-5 w-5 text-white" />
        </span>
        <span className="hero-float-c absolute bottom-16 left-0 z-20 flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5 sm:bottom-20 sm:-left-2">
          <Flame className="h-5 w-5 text-primary" />
        </span>
        <span className="hero-float-a absolute bottom-4 right-6 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 shadow-lg sm:right-12" style={{ animationDelay: "1.1s" }}>
          <Sparkles className="h-5 w-5 text-primary" />
        </span>

        <img
          src="/images/gym-mascot.png"
          alt="Your AI fitness coach mascot"
          className="relative z-10 w-full max-w-sm object-contain drop-shadow-2xl"
        />
      </div>
    </div>

    <style>{`
      @keyframes heroFloatA {
        0%, 100% { transform: translateY(0) rotate(-4deg); }
        50% { transform: translateY(-14px) rotate(4deg); }
      }
      @keyframes heroFloatB {
        0%, 100% { transform: translateY(0) rotate(6deg); }
        50% { transform: translateY(12px) rotate(-6deg); }
      }
      @keyframes heroFloatC {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(8deg); }
      }
      @keyframes heroPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.9; transform: scale(1.08); }
      }
      .hero-float-a { animation: heroFloatA 4.5s ease-in-out infinite; }
      .hero-float-b { animation: heroFloatB 3.6s ease-in-out infinite; animation-delay: 0.4s; }
      .hero-float-c { animation: heroFloatC 5.2s ease-in-out infinite; animation-delay: 0.8s; }
      .hero-pulse { animation: heroPulse 3s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce) {
        .hero-float-a, .hero-float-b, .hero-float-c, .hero-pulse { animation: none; }
      }
    `}</style>
  </section>
);
