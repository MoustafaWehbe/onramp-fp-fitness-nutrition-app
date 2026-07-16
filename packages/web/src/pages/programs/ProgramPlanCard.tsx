import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { ROUTES } from "../../constants/routes";
import { getGoalAccent, PROGRAM_STATS } from "../../constants/programs";
import {
  formatProgramLabel,
  type ProgramCatalogItem,
} from "../../lib/program-api";

interface ProgramPlanCardProps {
  program: ProgramCatalogItem;
  active?: boolean;
}

export const ProgramPlanCard = ({
  program,
  active = false,
}: ProgramPlanCardProps) => {
  const detailUrl = ROUTES.programDetail(program.slug);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden bg-ink text-white transition-all duration-200",
        active
          ? "ring-2 ring-primary shadow-[0_0_40px_-12px_#6ef362]"
          : "ring-1 ring-white/10 hover:-translate-y-1 hover:ring-primary/60",
      )}
    >
      <div
        className={cn(
          "h-1.5 w-full bg-gradient-to-r",
          getGoalAccent(program.goal),
        )}
      />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between gap-2">
          <span className="bg-white/10 px-2.5 py-1 font-heading text-[11px] font-semibold uppercase tracking-wide text-white/80">
            {formatProgramLabel(program.goal)}
          </span>
          <span className="font-heading text-[11px] font-medium uppercase tracking-wide text-white/40">
            {formatProgramLabel(program.level)}
          </span>
        </div>

        <h3 className="mt-5 font-display text-3xl uppercase leading-[0.95] tracking-tight">
          {program.title}
        </h3>
        <p className="mt-2 text-sm italic text-white/50">"{program.tagline}"</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-white/70 line-clamp-3">
          {program.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {program.focus.slice(0, 3).map((focus) => (
            <span
              key={focus}
              className="border border-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/50"
            >
              {formatProgramLabel(focus)}
            </span>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 divide-x divide-white/10 border border-white/10">
          {PROGRAM_STATS.map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 px-2 py-4 text-center"
            >
              <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-white/40">
                <s.icon className="h-3.5 w-3.5 text-primary" />
                {s.label}
              </span>
              <span className="font-display text-2xl text-white">
                {program[s.key]}
              </span>
            </div>
          ))}
        </div>

        {active ? (
          <div className="mt-6 flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 border border-white/15 px-4 py-2.5 font-heading text-xs font-semibold uppercase tracking-wide text-white/70">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Active plan
            </span>
            <Link
              to={detailUrl}
              className="font-heading text-xs font-semibold uppercase tracking-wide text-white/70 underline-offset-4 transition-colors hover:text-primary hover:underline"
            >
              View
            </Link>
          </div>
        ) : (
          <Link
            to={detailUrl}
            className="mt-6 inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-brand-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          >
            Start this plan
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>
    </div>
  );
};
