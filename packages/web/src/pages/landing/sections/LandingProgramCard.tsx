import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "../../../constants/routes";
import { PROGRAM_STATS } from "../../../constants/programs";
import {
  formatProgramLabel,
  type ProgramCatalogItem,
} from "../../../lib/program-api";

interface LandingProgramCardProps {
  program: ProgramCatalogItem;
}

export const LandingProgramCard = ({ program }: LandingProgramCardProps) => (
  <article className="group flex flex-col rounded-xl border border-white/10 bg-ink-800 p-8 transition-colors hover:border-brand-green">
    <div className="flex items-center gap-2">
      <span className="rounded-md bg-brand-green px-2.5 py-1 font-heading text-[11px] font-semibold uppercase tracking-wide text-[#0c2410]">
        {formatProgramLabel(program.goal)}
      </span>
      <span className="rounded-md border border-white/15 px-2.5 py-1 font-heading text-[11px] font-semibold uppercase tracking-wide text-white/50">
        {formatProgramLabel(program.level)}
      </span>
    </div>

    <h3 className="mt-6 font-sans text-2xl font-black uppercase leading-[0.95] tracking-tight text-white">
      {program.title}
    </h3>
    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/60">
      {program.tagline}
    </p>

    <dl className="mt-6 grid grid-cols-3 gap-3">
      {PROGRAM_STATS.map((s) => (
        <div
          key={s.label}
          className="rounded-lg border border-white/10 px-2 py-3 text-center"
        >
          <dt className="font-heading text-[10px] font-semibold uppercase tracking-wide text-white/40">
            {s.label}
          </dt>
          <dd className="mt-1 font-sans text-xl font-black tracking-tight text-white">
            {program[s.key]}
          </dd>
        </div>
      ))}
    </dl>

    <Link
      to={ROUTES.register}
      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-green px-5 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white"
    >
      Start this plan
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </Link>
  </article>
);
