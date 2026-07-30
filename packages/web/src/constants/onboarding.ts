import {
  Activity,
  Dumbbell,
  Flame,
  Scale,
  Sprout,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Goal = "lose_weight" | "build_muscle" | "maintain" | "strength";
export type Level = "beginner" | "intermediate" | "advanced";

export const GOAL_LABELS: Record<Goal, string> = {
  lose_weight: "Lose weight",
  build_muscle: "Build muscle",
  maintain: "Maintain",
  strength: "Strength",
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const GOAL_OPTIONS: ChoiceOption<Goal>[] = [
  {
    value: "lose_weight",
    label: GOAL_LABELS.lose_weight,
    description: "Shed fat with a calorie-smart plan.",
    icon: Flame,
  },
  {
    value: "build_muscle",
    label: GOAL_LABELS.build_muscle,
    description: "Add lean mass with progressive training.",
    icon: Dumbbell,
  },
  {
    value: "maintain",
    label: GOAL_LABELS.maintain,
    description: "Stay lean and keep your routine sharp.",
    icon: Scale,
  },
  {
    value: "strength",
    label: GOAL_LABELS.strength,
    description: "Get stronger with heavy compound lifts.",
    icon: Trophy,
  },
];

export const LEVEL_OPTIONS: ChoiceOption<Level>[] = [
  {
    value: "beginner",
    label: LEVEL_LABELS.beginner,
    description: "New to training or getting back into it.",
    icon: Sprout,
  },
  {
    value: "intermediate",
    label: LEVEL_LABELS.intermediate,
    description: "Comfortable with the basics, training regularly.",
    icon: Activity,
  },
  {
    value: "advanced",
    label: LEVEL_LABELS.advanced,
    description: "Years of consistent, structured training.",
    icon: Zap,
  },
];

export const ONBOARDING_STEP_LABELS = ["Goal", "Level"];
