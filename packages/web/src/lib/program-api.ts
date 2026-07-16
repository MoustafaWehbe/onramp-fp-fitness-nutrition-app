import { apiClient } from "./api-client";

export interface ProgramDayPreview {
  id: string;
  dayNumber: number;
  label: string;
  date: string;
  isRestDay: boolean;
  mealCount: number;
  workout: {
    id: string;
    name: string;
    type: string;
    duration: string;
    exerciseCount: number;
  } | null;
}

export interface ProgramMealPreview {
  id: string;
  type: string;
  time: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  items: Array<{
    id: string;
    name: string;
    quantity: string;
  }>;
}

export interface ProgramCatalogItem {
  id: string;
  slug: string;
  title: string;
  goal: string;
  level: string;
  duration: string;
  durationWeeks: number;
  daysPerWeek: number;
  dailyCalories: number;
  color: string | null;
  accent: string | null;
  startDate: string;
  currentWeek: number;
  currentDay: number;
  completedDays: number;
  totalDays: number;
  adherenceRate: number;
  mealCount: number;
  workoutCount: number;
  focus: string[];
  tagline: string;
  description: string;
  sampleWeek: ProgramDayPreview[];
  sampleMeals: ProgramMealPreview[];
}

export async function fetchPrograms(): Promise<ProgramCatalogItem[]> {
  const { data } = await apiClient.get<{ data: ProgramCatalogItem[] }>(
    "/programs",
  );
  return data.data;
}

export async function fetchProgramDetail(
  programId: string,
): Promise<ProgramCatalogItem> {
  const { data } = await apiClient.get<{ data: ProgramCatalogItem }>(
    `/programs/${programId}`,
  );
  return data.data;
}

export function formatProgramLabel(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\w\S*/g, (word) => word[0].toUpperCase() + word.slice(1).toLowerCase());
}
