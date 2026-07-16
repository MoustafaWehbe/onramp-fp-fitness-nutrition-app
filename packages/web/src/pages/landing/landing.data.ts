import {
  ClipboardList,
  LineChart,
  MessageSquareText,
  type LucideIcon,
} from "lucide-react";

export interface HowStep {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

export const HERO_STATS: HeroStat[] = [
  { value: "Live", label: "PostgreSQL programs" },
  { value: "Real", label: "Daily log history" },
  { value: "RAG", label: "AI coach context" },
];

export const MARQUEE_ITEMS: string[] = [
  "Workout plans",
  "Meal plans with macros",
  "Daily logging",
  "AI coach",
  "Progress charts",
];

export const HOW_STEPS: HowStep[] = [
  {
    icon: ClipboardList,
    title: "Pick your program",
    body: "Browse the catalog and choose the goal that fits you. It instantly becomes your day-by-day workout and meal plan.",
  },
  {
    icon: LineChart,
    title: "Log what you actually do",
    body: "Every day, mark meals eaten and workouts done, skipped, or modified. Your real history builds up over time.",
  },
  {
    icon: MessageSquareText,
    title: "Get a coach that knows you",
    body: "The AI sees your plan and your logged history, so the advice is personal, never generic.",
  },
];

export const COACH_QUESTIONS: string[] = [
  "How did I do today?",
  "Can I eat this right now and stay on my plan?",
  "Should I do this workout today, or rest?",
];
