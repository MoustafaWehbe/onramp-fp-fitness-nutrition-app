import { useCallback, useEffect, useState } from "react";
import { AlertCircle, RotateCw, SearchX } from "lucide-react";
import { LANDING_SECTIONS } from "../../../constants/routes";
import {
  fetchPrograms,
  type ProgramCatalogItem,
} from "../../../lib/program-api";
import { LandingProgramCard } from "./LandingProgramCard";

export const FeaturedPrograms = () => {
  const [programs, setPrograms] = useState<ProgramCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      setPrograms(await fetchPrograms());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPrograms();
  }, [loadPrograms]);

  return (
    <section
      id={LANDING_SECTIONS.programs.replace("#", "")}
      className="bg-ink py-24 text-white sm:py-28"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="max-w-2xl">
          <p className="eyebrow text-brand-green">The catalog</p>
          <h2 className="mt-3 font-sans text-3xl font-black uppercase leading-[0.95] tracking-tight sm:text-4xl lg:text-5xl">
            Pick a program,
            <span className="block text-brand-green">start this week</span>
          </h2>
          <p className="mt-5 text-base text-white/70 sm:text-lg">
            Every program here is the real thing you get after signing up.
            Nothing is a mock-up.
          </p>
        </div>

        {loading ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[380px] animate-pulse rounded-xl border border-white/10 bg-ink-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="mt-14 flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/15 px-6 py-16 text-center">
            <AlertCircle className="h-9 w-9 text-brand-green" aria-hidden />
            <p className="font-heading text-xl font-bold uppercase tracking-wide">
              Programs could not be loaded
            </p>
            <p className="max-w-sm text-sm text-white/60">
              We would rather show you nothing than show you a placeholder.
            </p>
            <button
              type="button"
              onClick={() => void loadPrograms()}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-brand-green px-6 py-3 font-heading text-sm font-semibold uppercase tracking-wide text-[#0c2410] transition-colors hover:bg-white"
            >
              <RotateCw className="h-4 w-4" aria-hidden />
              Try again
            </button>
          </div>
        ) : programs.length > 0 ? (
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((program) => (
              <LandingProgramCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="mt-14 flex flex-col items-center gap-4 rounded-xl border border-dashed border-white/15 px-6 py-16 text-center">
            <SearchX className="h-9 w-9 text-white/40" aria-hidden />
            <p className="font-heading text-xl font-bold uppercase tracking-wide">
              No programs yet
            </p>
            <p className="max-w-sm text-sm text-white/60">
              The catalog is empty right now. Check back shortly.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
