import { useEffect, useMemo, useState } from "react";
import { Loader2, SearchX } from "lucide-react";
import { apiClient } from "../../lib/api-client";
import type { Program } from "../../mocks/types";
import { usePreferences } from "../../hooks/usePreferences";
import { ProgramPlanCard } from "./ProgramPlanCard";
import { ProgramFilters, type ProgramFilterState } from "./ProgramFilters";

const initialFilters: ProgramFilterState = {
  search: "",
  goal: "all",
  level: "all",
};

export const BrowsePrograms = () => {
  const { preferences } = usePreferences();
  const [filters, setFilters] = useState<ProgramFilterState>(() => ({
    ...initialFilters,
    goal: preferences.goal ?? "all",
    level: preferences.level ?? "all",
  }));

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    apiClient
      .get<{ data: Program[] }>("/programs")
      .then(({ data }) => {
        if (!cancelled) setPrograms(data.data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const results = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return programs.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
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

      <ProgramFilters value={filters} onChange={setFilters} />

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Loading programs…</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-20 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground" />
          <p className="font-heading text-lg font-bold uppercase">
            Couldn't load programs
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Something went wrong fetching the catalog. Please try again.
          </p>
        </div>
      ) : (
        <>
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

          {results.length > 0 ? (
            <div className="grid items-stretch gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => (
                <ProgramPlanCard key={p.id} program={p} />
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
        </>
      )}
    </div>
  );
};
