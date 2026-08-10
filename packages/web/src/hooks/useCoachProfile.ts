import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiCoachProfile, ApiCoachProfileInput } from "../lib/api-types";

export const useCoachProfile = () => {
  const [profile, setProfile] = useState<ApiCoachProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const { data } = await apiClient.get<{ data: ApiCoachProfile | null }>(
          "/coach-profile",
        );
        if (active) setProfile(data.data);
      } catch {
        if (active) setError("Failed to load your coach profile");
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const saveProfile = async (input: ApiCoachProfileInput) => {
    const { data } = await apiClient.patch<{ data: ApiCoachProfile }>(
      "/coach-profile",
      input,
    );
    setProfile(data.data);
    return data.data;
  };

  return { profile, isLoading, error, saveProfile };
};
