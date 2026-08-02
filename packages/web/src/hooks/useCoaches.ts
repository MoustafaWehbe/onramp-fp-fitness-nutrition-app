import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiCoach } from "../lib/api-types";

export function useCoaches() {
  const [coaches, setCoaches] = useState<ApiCoach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await apiClient.get<{ data: ApiCoach[] }>("/coaches");
        setCoaches(data.data);
      } catch (err) {
        setError("Failed to load coaches");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { coaches, isLoading, error };
}