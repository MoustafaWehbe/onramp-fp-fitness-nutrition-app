import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { Goal, Level } from "../constants/onboarding";

export interface UserPreferences {
  goal: Goal | null;
  level: Level | null;
  completed: boolean;
}

const PREFERENCES_KEY = "fitcoach.preferences";

const defaultPreferences: UserPreferences = {
  goal: null,
  level: null,
  completed: false,
};

export const usePreferences = () => {
  const [preferences, setPreferences, reset] = useLocalStorage<UserPreferences>(
    PREFERENCES_KEY,
    defaultPreferences,
  );

  const update = useCallback(
    (patch: Partial<UserPreferences>) =>
      setPreferences((prev) => ({ ...prev, ...patch })),
    [setPreferences],
  );

  return {
    preferences,
    update,
    reset,
    hasCompletedOnboarding: preferences.completed,
  };
};
