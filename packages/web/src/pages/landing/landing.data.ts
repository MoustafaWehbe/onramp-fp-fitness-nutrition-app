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

export interface ChatMessage {
  from: "user" | "ai";
  text: string;
}

export const HERO_STATS: HeroStat[] = [
  { value: "50+", label: "Ready-made programs" },
  { value: "1.2M", label: "Workouts logged" },
  { value: "94%", label: "Hit their goal" },
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
    body: "The AI sees your plan and your logged history — so the advice is personal, never generic.",
  },
];

export const COACH_QUESTIONS: string[] = [
  "How did I do today?",
  "Can I eat this right now and stay on my plan?",
  "Should I do this workout today, or rest?",
];

export const COACH_CHAT: ChatMessage[] = [
  { from: "user", text: "How did I do today?" },
  {
    from: "ai",
    text: "Strong day. You hit 1,790 of 1,800 kcal and nailed your protein at 152g. You completed Full Body B but skipped the finisher — want me to add it tomorrow or let it slide?",
  },
  { from: "user", text: "Can I eat a slice of pizza tonight?" },
  {
    from: "ai",
    text: "You've got 290 kcal and 18g fat left for the day — one slice fits. Skip the soda and you're still on plan.",
  },
];
