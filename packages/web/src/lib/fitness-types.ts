export interface FitnessPlan {
  id: string;
  name: string;
  focus: string;
  calorieTarget: number;
  proteinTarget: number;
  workoutTargetPerWeek: number;
}

export interface DailyLog {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  workoutCompleted: boolean;
  note: string;
}

export interface WeeklyNutrition {
  week: string;
  calories: number;
  target: number;
}

export interface WeeklyWorkoutCompletion {
  week: string;
  completed: number;
  target: number;
}

export interface MacroBreakdown {
  label: string;
  grams: number;
  color: string;
}

export interface MeasurementEntry {
  date: string;
  weight: number;
  waist: number;
  chest: number;
  hips: number;
}
