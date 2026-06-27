import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { PROGRAMS } from "../../mocks/programs";
import { activeProgram } from "../../mock-data/mockData";
import { ProgramPlanCard } from "./ProgramPlanCard";
import { ProgramFilters, type ProgramFilterState } from "./ProgramFilters";

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
            <ProgramPlanCard
              key={p.id}
              program={p}
              active={p.title === activeProgram.title}
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
