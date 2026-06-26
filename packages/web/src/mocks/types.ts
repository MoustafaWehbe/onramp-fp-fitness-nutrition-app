export type Goal =
  | "lose_weight"
  | "build_muscle"
  | "maintain"
  | "strength";

export type Level = "beginner" | "intermediate" | "advanced";

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface WorkoutDay {
  day: string;
  title: string;
  focus: string;
  durationMin: number;
  rest: boolean;
}

export interface Meal {
  name: string;
  items: string;
  calories: number;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  goal: Goal;
  level: Level;
  tagline: string;
  description: string;
  durationWeeks: number;
  daysPerWeek: number;
  dailyCalories: number;
  macros: Macros;
  focus: string[];
  equipment: string;
  image: string;
  rating: number;
  enrolled: number;
  sampleWeek: WorkoutDay[];
  sampleMeals: Meal[];
}

export interface OnboardingData {
  goal: Goal | null;
  level: Level | null;
  name: string;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;
  daysPerWeek: number | null;
  dietaryPrefs: string[];
  injuries: string;
}

export const GOAL_LABELS: Record<Goal, string> = {
  lose_weight: "Lose Weight",
  build_muscle: "Build Muscle",
  maintain: "Maintain & Tone",
  strength: "Strength",
};

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};
