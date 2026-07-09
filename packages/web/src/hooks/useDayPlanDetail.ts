import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiDayPlanDetail } from "../lib/api-types";

export function useDayPlanDetail(dayPlanId: string | null) {
  const [dayPlan, setDayPlan] = useState<ApiDayPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dayPlanId) {
      setDayPlan(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    apiClient
      .get<{ data: ApiDayPlanDetail }>(`/day-plans/${dayPlanId}`)
      .then(({ data }) => {
        if (!cancelled) setDayPlan(data.data);
      })
      .catch(() => {
        if (!cancelled) {
          setDayPlan(null);
          setError("Failed to load day plan details");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [dayPlanId]);

  return { dayPlan, isLoading, error };
}
