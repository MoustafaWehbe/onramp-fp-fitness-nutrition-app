import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiCoachProgram, ApiCoachRequestWithClient } from "../lib/api-types";

type CreateProgramInput = {
  coachRequestId: string;
  title: string;
  goal: string;
  level: string;
  calories: number;
  startDate?: string;
};

export const useCoachPrograms = () => {
  const [programs, setPrograms] = useState<ApiCoachProgram[]>([]);
  const [clients, setClients] = useState<ApiCoachRequestWithClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const load = useCallback(async () => {
    try {
      const [programsRes, clientsRes] = await Promise.all([
        apiClient.get<{ data: ApiCoachProgram[] }>("/coach/programs"),
        apiClient.get<{ data: ApiCoachRequestWithClient[] }>(
          "/coach-requests/accepted",
        ),
      ]);
      if (!isMounted.current) return;
      setPrograms(programsRes.data.data);
      setClients(clientsRes.data.data);
      setError(null);
    } catch {
      if (isMounted.current) setError("Failed to load your programs");
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const createProgram = async (input: CreateProgramInput) => {
    const { data } = await apiClient.post<{ data: ApiCoachProgram }>(
      "/coach/programs",
      input,
    );
    await load();
    return data.data;
  };

  return { programs, clients, isLoading, error, createProgram, reload: load };
};
