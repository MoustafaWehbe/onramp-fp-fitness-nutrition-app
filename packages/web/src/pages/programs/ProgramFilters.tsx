import { Search } from "lucide-react";
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

const goalOptions = Object.entries(GOAL_LABELS) as [Goal, string][];
const levelOptions = Object.entries(LEVEL_LABELS) as [Level, string][];

export const ProgramFilters = ({ value, onChange }: ProgramFiltersProps) => (
  <div className="flex flex-col gap-3 sm:flex-row">
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value.search}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
        placeholder="Search programs…"
        className="pl-9"
      />
    </div>

    <Select
      value={value.goal}
      onChange={(e) =>
        onChange({ ...value, goal: e.target.value as Goal | "all" })
      }
      className="sm:w-48"
    >
      <option value="all">All goals</option>
      {goalOptions.map(([val, label]) => (
        <option key={val} value={val}>
          {label}
        </option>
      ))}
    </Select>

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
);
