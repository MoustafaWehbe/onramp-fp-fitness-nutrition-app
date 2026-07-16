import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Loader2, SearchX } from "lucide-react";
import { ProgramPlanCard } from "./ProgramPlanCard";
import { ProgramFilters, type ProgramFilterState } from "./ProgramFilters";
import {
  fetchPrograms,
  type ProgramCatalogItem,
} from "../../lib/program-api";
import { Button } from "../../components/ui/button";

const initialFilters: ProgramFilterState = {
  search: "",
  goal: "all",
  level: "all",
};

export const BrowsePrograms = () => {
  const [filters, setFilters] = useState<ProgramFilterState>(initialFilters);
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

  const activeProgramId = programs[0]?.id ?? null;
  const goals = useMemo(
    () => Array.from(new Set(programs.map((program) => program.goal))).sort(),
    [programs],
  );
  const levels = useMemo(
    () => Array.from(new Set(programs.map((program) => program.level))).sort(),
    [programs],
  );

  const results = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return programs.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.focus.some((f) => f.toLowerCase().includes(q));
      const matchesGoal = filters.goal === "all" || p.goal === filters.goal;
      const matchesLevel = filters.level === "all" || p.level === filters.level;
      return matchesQuery && matchesGoal && matchesLevel;
    });
  }, [filters, programs]);

  const hasFilters =
    filters.search !== "" || filters.goal !== "all" || filters.level !== "all";

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-muted-foreground">The catalog</p>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-tight sm:text-5xl">
          Choose your program
        </h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Each plan includes a full weekly meal and workout schedule — pick one
          and it becomes your day-by-day plan.
        </p>
      </div>

      <ProgramFilters
        value={filters}
        goals={goals}
        levels={levels}
        onChange={setFilters}
      />

      {!loading && !error && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {results.length} program{results.length === 1 ? "" : "s"}
          </span>
          {hasFilters && (
            <button
              onClick={() => setFilters(initialFilters)}
              className="font-medium text-foreground hover:text-primary"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-[420px] animate-pulse border border-border bg-card"
            />
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-20 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <p className="font-heading text-lg font-bold uppercase">{error}</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            The catalog only renders real API data. Retry when the API/database is
            available.
          </p>
          <Button onClick={() => void loadPrograms()} className="gap-2">
            <Loader2 className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : results.length > 0 ? (
        <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((p) => (
            <ProgramPlanCard
              key={p.id}
              program={p}
              active={p.id === activeProgramId}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-20 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading text-lg font-bold uppercase">
            No programs found
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Try a different search term or clear your filters to see the full
            catalog.
          </p>
        </div>
      )}
    </div>
  );
};
