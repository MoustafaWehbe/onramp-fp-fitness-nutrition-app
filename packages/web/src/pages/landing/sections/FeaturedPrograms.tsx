import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Loader2, SearchX } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { ROUTES, LANDING_SECTIONS } from "../../../constants/routes";
import {
  fetchPrograms,
  type ProgramCatalogItem,
} from "../../../lib/program-api";
import { ProgramPlanCard } from "../../programs/ProgramPlanCard";

export const FeaturedPrograms = () => {
  const [programs, setPrograms] = useState<ProgramCatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrograms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPrograms(await fetchPrograms());
    } catch {
      setError("Programs could not be loaded from PostgreSQL.");
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
      className="border-t border-border bg-secondary py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-6">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow text-muted-foreground">The live catalog</p>
            <h2 className="mt-3 font-display text-4xl uppercase tracking-tight sm:text-5xl">
              Pick your program
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              This preview renders the same PostgreSQL-backed programs used
              after sign in.
            </p>
          </div>
          <Link
            to={ROUTES.programs}
            className="group inline-flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-foreground hover:text-primary"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse border border-border bg-card"
              />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-16 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-heading text-lg font-bold uppercase">{error}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              No placeholder catalog is shown when the API or database is
              unavailable.
            </p>
            <Button onClick={() => void loadPrograms()} className="gap-2">
              <Loader2 className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : programs.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((program) => (
              <ProgramPlanCard key={program.id} program={program} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-16 text-center">
            <SearchX className="h-10 w-10 text-muted-foreground" />
            <p className="font-heading text-lg font-bold uppercase">
              No programs available
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Seed or create a real program in PostgreSQL to populate this
              section.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
