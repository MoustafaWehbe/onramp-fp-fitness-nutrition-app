import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiProgram, ApiDayPlanSummary } from "../lib/api-types";

export function useActiveProgram() {
  const [program, setProgram] = useState<ApiProgram | null>(null);
  const [dayPlans, setDayPlans] = useState<ApiDayPlanSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: programRes } = await apiClient.get<{ data: ApiProgram | null }>(
          "/programs/active",
        );

        if (!programRes.data) {
          // No program assigned yet — not an error, just an empty state.
          setProgram(null);
          setDayPlans([]);
          setIsLoading(false);
          return;
        }

        setProgram(programRes.data);

        const { data: daysRes } = await apiClient.get<{ data: ApiDayPlanSummary[] }>(
          `/programs/${programRes.data.id}/day-plans`,
        );
        setDayPlans(daysRes.data);
      } catch (err) {
        setError("Failed to load program");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { program, dayPlans, isLoading, error };
}