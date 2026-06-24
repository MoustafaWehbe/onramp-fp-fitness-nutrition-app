import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { PROGRAMS } from "../../mocks/programs";
import { ProgramCard } from "./ProgramCard";
import {
  ProgramFilters,
  type ProgramFilterState,
} from "./ProgramFilters";

const initialFilters: ProgramFilterState = {
  search: "",
  goal: "all",
  level: "all",
};

export const BrowsePrograms = () => {
  const [filters, setFilters] = useState<ProgramFilterState>(initialFilters);

  const results = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return PROGRAMS.filter((p) => {
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.focus.some((f) => f.toLowerCase().includes(q));
      const matchesGoal = filters.goal === "all" || p.goal === filters.goal;
      const matchesLevel = filters.level === "all" || p.level === filters.level;
      return matchesQuery && matchesGoal && matchesLevel;
    });
  }, [filters]);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-muted-foreground">The catalog</p>
        <h1 className="mt-2 font-display text-4xl uppercase tracking-tight">
          Browse programs
        </h1>
        <p className="mt-1 text-muted-foreground">
          Pick the plan that matches your goal — it becomes your personal
          schedule.
        </p>
      </div>

      <ProgramFilters value={filters} onChange={setFilters} />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {results.length} program{results.length === 1 ? "" : "s"}
        </span>
        {filters !== initialFilters &&
          (filters.search || filters.goal !== "all" || filters.level !== "all") && (
            <button
              onClick={() => setFilters(initialFilters)}
              className="font-medium text-foreground hover:text-primary"
            >
              Clear filters
            </button>
          )}
      </div>

      {results.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProgramCard key={p.id} program={p} />
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
