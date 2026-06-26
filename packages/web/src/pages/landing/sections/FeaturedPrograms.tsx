import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES, LANDING_SECTIONS } from "../../../constants/routes";
import { PROGRAMS } from "../../../mocks/programs";
import { ProgramCard } from "../../programs/ProgramCard";

export const FeaturedPrograms = () => (
  <section
    id={LANDING_SECTIONS.programs.replace("#", "")}
    className="border-t border-border bg-secondary py-24"
  >
    <div className="mx-auto w-full max-w-7xl px-6">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="eyebrow text-muted-foreground">The catalog</p>
          <h2 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
            Pick your program
          </h2>
        </div>
        <Link
          to={ROUTES.programs}
          className="group inline-flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PROGRAMS.slice(0, 3).map((p) => (
          <ProgramCard key={p.id} program={p} />
        ))}
      </div>
    </div>
  </section>
);
