import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  type Goal,
  type Level,
} from "../../mocks/types";

export interface ProgramFilterState {
  search: string;
  goal: Goal | "all";
  level: Level | "all";
}

interface ProgramFiltersProps {
  value: ProgramFilterState;
  onChange: (next: ProgramFilterState) => void;
}

const goalChips: { value: Goal | "all"; label: string }[] = [
  { value: "all", label: "All" },
  ...(Object.entries(GOAL_LABELS) as [Goal, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

const levelOptions = Object.entries(LEVEL_LABELS) as [Level, string][];

export const ProgramFilters = ({ value, onChange }: ProgramFiltersProps) => (
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
          onChange({ ...value, level: e.target.value as Level | "all" })
        }
        className="sm:w-44"
      >
        <option value="all">All levels</option>
        {levelOptions.map(([val, label]) => (
          <option key={val} value={val}>
            {label}
          </option>
        ))}
      </Select>
    </div>

    <div className="flex flex-wrap gap-2">
      {goalChips.map((chip) => {
        const active = value.goal === chip.value;
        return (
          <button
            key={chip.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange({ ...value, goal: chip.value })}
            className={cn(
              "rounded-full border px-4 py-1.5 font-heading text-xs font-semibold uppercase tracking-wide transition-colors",
              active
                ? "border-primary bg-primary text-ink"
                : "border-border text-muted-foreground hover:border-primary hover:text-foreground",
            )}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  </div>
);
