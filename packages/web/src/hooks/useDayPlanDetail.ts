import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiDayPlanDetail } from "../lib/api-types";

export function useDayPlanDetail(dayPlanId: string | null) {
  const [dayPlan, setDayPlan] = useState<ApiDayPlanDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!dayPlanId) return;
    setIsLoading(true);
    apiClient
      .get<{ data: ApiDayPlanDetail }>(`/day-plans/${dayPlanId}`)
      .then(({ data }) => setDayPlan(data.data))
      .finally(() => setIsLoading(false));
  }, [dayPlanId]);

  return { dayPlan, isLoading };
}