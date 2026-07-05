import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiMealLog, ApiWorkoutLog } from "../lib/api-types";

export function useDayLogs(dayPlanId: string | null) {
  const [mealLogs, setMealLogs] = useState<ApiMealLog[]>([]);
  const [workoutLog, setWorkoutLog] = useState<ApiWorkoutLog | null>(null);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);

  useEffect(() => {
    if (!dayPlanId) return;
    apiClient
      .get<{ data: { mealLogs: ApiMealLog[]; workoutLog: ApiWorkoutLog | null; completedExerciseIds: string[] } }>(
        `/day-plans/${dayPlanId}/logs`,
      )
      .then(({ data }) => {
        setMealLogs(data.data.mealLogs);
        setWorkoutLog(data.data.workoutLog);
        setCompletedExerciseIds(data.data.completedExerciseIds);
      });
  }, [dayPlanId]);

  return { mealLogs, workoutLog, completedExerciseIds };
}