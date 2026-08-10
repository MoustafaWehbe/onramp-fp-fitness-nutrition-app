import { useCallback, useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiBuilderDayInput, ApiCoachProgram } from "../lib/api-types";

/** The API returns the whole program after every write, so state stays in sync. */
export const useCoachProgram = (programId: string | undefined) => {
  const [program, setProgram] = useState<ApiCoachProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgram = useCallback(async () => {
    const { data } = await apiClient.get<{ data: ApiCoachProgram }>(
      `/coach/programs/${programId}`,
    );
    return data.data;
  }, [programId]);

  useEffect(() => {
    if (!programId) {
      setError("Program not found");
      setIsLoading(false);
      return;
    }

    // Guards against a response landing after the component unmounts or the
    // programId changes mid-flight.
    let active = true;

    const load = async () => {
      try {
        const loaded = await fetchProgram();
        if (!active) return;
        setProgram(loaded);
        setError(null);
      } catch {
        if (active) setError("Failed to load program");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [programId, fetchProgram]);

  const saveDay = async (dayNumber: number, day: ApiBuilderDayInput) => {
    const { data } = await apiClient.put<{ data: ApiCoachProgram }>(
      `/coach/programs/${programId}/days/${dayNumber}`,
      day,
    );
    setProgram(data.data);
    return data.data;
  };

  const publish = async () => {
    const { data } = await apiClient.post<{ data: ApiCoachProgram }>(
      `/coach/programs/${programId}/publish`,
    );
    setProgram(data.data);
    return data.data;
  };

  const reload = async () => setProgram(await fetchProgram());

  return { program, isLoading, error, saveDay, publish, reload };
};
