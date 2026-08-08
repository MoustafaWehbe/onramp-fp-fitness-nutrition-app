import { useEffect, useState } from "react";
import { apiClient } from "../lib/api-client";
import type { ApiUserProfile } from "../lib/api-types";

export function useUserProfile() {
  const [profile, setProfile] = useState<ApiUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await apiClient.get<{ data: ApiUserProfile | null }>("/profile");
        setProfile(data.data);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  async function saveProfile(payload: Omit<ApiUserProfile, "id" | "userId" | "completedAt">) {
    const { data } = await apiClient.put<{ data: ApiUserProfile }>("/profile", payload);
    setProfile(data.data);
    return data.data;
  }

  return { profile, isLoading, error, saveProfile };
}