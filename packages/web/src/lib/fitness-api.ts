import { apiClient } from "./api-client";
import type {
  DailyLog,
  FitnessPlan,
  MacroBreakdown,
  MeasurementEntry,
  WeeklyNutrition,
  WeeklyWorkoutCompletion,
} from "./fitness-types";

export interface FitnessChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
}

export interface FitnessSummary {
  activePlan: FitnessPlan;
  dailyLogs: DailyLog[];
  weeklyNutrition: WeeklyNutrition[];
  weeklyWorkoutCompletion: WeeklyWorkoutCompletion[];
  macroBreakdown: MacroBreakdown[];
  measurements: MeasurementEntry[];
  chatMessages: FitnessChatMessage[];
}

export async function fetchFitnessSummary(): Promise<FitnessSummary> {
  const { data } = await apiClient.get<{ data: FitnessSummary }>(
    "/fitness/summary",
  );
  return data.data;
}

export async function saveFitnessMeasurement(
  measurement: Omit<MeasurementEntry, "date">,
): Promise<MeasurementEntry[]> {
  const { data } = await apiClient.post<{ data: { measurements: MeasurementEntry[] } }>(
    "/fitness/measurements",
    measurement,
  );
  return data.data.measurements;
}

export async function sendFitnessChatMessage(
  message: string,
): Promise<FitnessChatMessage[]> {
  const { data } = await apiClient.post<{ data: { messages: FitnessChatMessage[] } }>(
    "/fitness/chat",
    { message },
  );
  return data.data.messages;
}
