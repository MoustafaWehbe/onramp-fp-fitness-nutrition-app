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

const activePlan: FitnessPlan = {
  id: "lean-strength-8-week",
  name: "Lean Strength 8-Week Plan",
  focus: "Build strength while holding a small calorie deficit",
  calorieTarget: 2200,
  proteinTarget: 165,
  workoutTargetPerWeek: 5,
};

const dailyLogs: DailyLog[] = [
  {
    date: "2026-06-19",
    calories: 2260,
    protein: 158,
    carbs: 248,
    fat: 69,
    workoutCompleted: true,
    note: "Upper strength day felt strong.",
  },
  {
    date: "2026-06-20",
    calories: 2135,
    protein: 171,
    carbs: 214,
    fat: 62,
    workoutCompleted: true,
    note: "Walked after dinner and hit protein.",
  },
  {
    date: "2026-06-21",
    calories: 2190,
    protein: 162,
    carbs: 236,
    fat: 65,
    workoutCompleted: false,
    note: "Recovery day with mobility work.",
  },
  {
    date: "2026-06-22",
    calories: 2325,
    protein: 168,
    carbs: 260,
    fat: 72,
    workoutCompleted: true,
    note: "Lower body session completed.",
  },
  {
    date: "2026-06-23",
    calories: 2180,
    protein: 174,
    carbs: 221,
    fat: 67,
    workoutCompleted: true,
    note: "Good hydration and sleep.",
  },
  {
    date: "2026-06-24",
    calories: 2110,
    protein: 166,
    carbs: 205,
    fat: 64,
    workoutCompleted: true,
    note: "Conditioning finisher was tough but done.",
  },
  {
    date: "2026-06-25",
    calories: 2165,
    protein: 170,
    carbs: 219,
    fat: 66,
    workoutCompleted: true,
    note: "Logged breakfast and planned dinner early.",
  },
];

export const weeklyNutrition: WeeklyNutrition[] = [
  { week: "Jun 1", calories: 2310, target: 2200 },
  { week: "Jun 8", calories: 2240, target: 2200 },
  { week: "Jun 15", calories: 2185, target: 2200 },
  { week: "Jun 22", calories: 2160, target: 2200 },
];

export const weeklyWorkoutCompletion: WeeklyWorkoutCompletion[] = [
  { week: "Jun 1", completed: 3, target: 5 },
  { week: "Jun 8", completed: 4, target: 5 },
  { week: "Jun 15", completed: 4, target: 5 },
  { week: "Jun 22", completed: 5, target: 5 },
];

export const macroBreakdown: MacroBreakdown[] = [
  { label: "Protein", grams: 170, color: "#2563eb" },
  { label: "Carbs", grams: 225, color: "#16a34a" },
  { label: "Fat", grams: 66, color: "#f97316" },
];

export const defaultMeasurements: MeasurementEntry[] = [
  { date: "Jun 1", weight: 184.6, waist: 35.5, chest: 42.1, hips: 40.2 },
  { date: "Jun 8", weight: 183.8, waist: 35.1, chest: 42.2, hips: 40.1 },
  { date: "Jun 15", weight: 182.9, waist: 34.8, chest: 42.3, hips: 39.9 },
  { date: "Jun 22", weight: 181.7, waist: 34.4, chest: 42.4, hips: 39.8 },
];

function readLocalStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getActivePlan(): FitnessPlan {
  return readLocalStorage("fitcoach.activePlan", activePlan);
}

export function getDailyLogs(): DailyLog[] {
  return readLocalStorage("fitcoach.dailyLogs", dailyLogs);
}

export function getMeasurements(): MeasurementEntry[] {
  return readLocalStorage("fitcoach.measurements", defaultMeasurements);
}

export function saveMeasurements(entries: MeasurementEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("fitcoach.measurements", JSON.stringify(entries));
}
