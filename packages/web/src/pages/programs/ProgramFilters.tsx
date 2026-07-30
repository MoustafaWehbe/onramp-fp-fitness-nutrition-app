import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { formatProgramLabel } from "../../lib/program-api";

export interface ProgramFilterState {
  search: string;
  goal: string;
  level: string;
}

interface ProgramFiltersProps {
  value: ProgramFilterState;
  goals: string[];
  levels: string[];
  onChange: (next: ProgramFilterState) => void;
}

export const ProgramFilters = ({
  value,
  goals,
  levels,
  onChange,
}: ProgramFiltersProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search programs…"
          className="pl-9"
        />
      </div>

      <Select
        value={value.level}
        onChange={(e) =>
          onChange({ ...value, level: e.target.value })
        }
        className="sm:w-44"
      >
        <option value="all">All levels</option>
        {levels.map((level) => (
          <option key={level} value={level}>
            {formatProgramLabel(level)}
          </option>
        ))}
      </Select>
    </div>

    <div className="flex flex-wrap gap-2">
      {["all", ...goals].map((goal) => {
        const active = value.goal === goal;
        return (
          <button
            key={goal}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ ...value, goal })}
            className={cn(
              "rounded-full border px-4 py-1.5 font-heading text-xs font-semibold uppercase tracking-wide transition-colors",
              active
                ? "border-primary bg-primary text-ink"
                : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
            )}
              >
            {goal === "all" ? "All" : formatProgramLabel(goal)}
          </button>
        );
      })}
    </div>
  </div>
);
