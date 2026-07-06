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
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  type Goal,
  type Level,
} from "../mocks/types";

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
