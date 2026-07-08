import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiMealLog, ApiWorkoutLog } from "../lib/api-types";

export function useDayLogs(dayPlanId: string | null) {
  const [mealLogs, setMealLogs] = useState<ApiMealLog[]>([]);
  const [workoutLog, setWorkoutLog] = useState<ApiWorkoutLog | null>(null);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dayPlanId) {
      setMealLogs([]);
      setWorkoutLog(null);
      setCompletedExerciseIds([]);
      setError(null);
      return;
    }

    let cancelled = false;
    setError(null);
    apiClient
      .get<{ data: { mealLogs: ApiMealLog[]; workoutLog: ApiWorkoutLog | null; completedExerciseIds: string[] } }>(
        `/day-plans/${dayPlanId}/logs`,
      )
      .then(({ data }) => {
        if (cancelled) return;
        setMealLogs(data.data.mealLogs);
        setWorkoutLog(data.data.workoutLog);
        setCompletedExerciseIds(data.data.completedExerciseIds);
      })
      .catch(() => {
        if (!cancelled) {
          setMealLogs([]);
          setWorkoutLog(null);
          setCompletedExerciseIds([]);
          setError("Failed to load saved day logs");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dayPlanId]);

  return { mealLogs, workoutLog, completedExerciseIds, error };
}
