import {
  CalendarDays,
  Dumbbell,
  Flame,
  type LucideIcon,
} from "lucide-react";
import type { Goal } from "../mocks/types";

export const GOAL_ACCENTS: Record<Goal, string> = {
  lose_weight: "from-brand-green to-emerald-400",
  build_muscle: "from-fuchsia-500 to-violet-500",
  maintain: "from-sky-400 to-cyan-400",
  strength: "from-amber-400 to-orange-500",
};

export interface ProgramStat {
  icon: LucideIcon;
  label: string;
  key: "durationWeeks" | "dailyCalories" | "daysPerWeek";
}

export const PROGRAM_STATS: ProgramStat[] = [
  { icon: CalendarDays, label: "Weeks", key: "durationWeeks" },
  { icon: Flame, label: "Kcal/day", key: "dailyCalories" },
  { icon: Dumbbell, label: "Workouts/wk", key: "daysPerWeek" },
];
