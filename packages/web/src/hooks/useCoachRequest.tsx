import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiCoachRequest } from "../lib/api-types";

export function useCoachRequest() {
  const [request, setRequest] = useState<ApiCoachRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await apiClient.get<{ data: ApiCoachRequest | null }>("/coach-requests/mine");
        setRequest(data.data);
      } catch (err) {
        setError("Failed to load coach request");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function requestCoach(coachId: string, message?: string) {
  const { data } = await apiClient.post<{ data: ApiCoachRequest }>("/coach-requests", { coachId, message });
  setRequest(data.data);
  return data.data;
}

  return { request, isLoading, error, requestCoach };
}