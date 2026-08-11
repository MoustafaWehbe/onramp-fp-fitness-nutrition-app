export interface AuthStat {
  value: string;
  label: string;
}

export const AUTH_HIGHLIGHTS: string[] = [
  "A full week of workouts and meals, planned for you",
  "Log what you ate and trained in a few taps",
  "A coach that answers from your own history",
];

export const AUTH_STATS: AuthStat[] = [
  { value: "7 days", label: "Planned ahead" },
  { value: "Daily", label: "Meals and workouts logged" },
  { value: "Yours", label: "Advice built on your week" },
];
