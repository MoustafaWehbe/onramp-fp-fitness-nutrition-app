import {
  CalendarDays,
  Dumbbell,
  Flame,
  type LucideIcon,
} from "lucide-react";

export function getGoalAccent(goal: string): string {
  const key = goal.toLowerCase();
  if (key.includes("fat") || key.includes("loss") || key.includes("weight")) {
    return "from-brand-green to-emerald-400";
  }
  if (key.includes("muscle") || key.includes("build")) {
    return "from-fuchsia-500 to-violet-500";
  }
  if (key.includes("strength")) {
    return "from-amber-400 to-orange-500";
  }
  return "from-sky-400 to-cyan-400";
}

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
