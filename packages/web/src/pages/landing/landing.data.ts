import {
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LineChart,
  MessageSquareText,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export interface HowStep {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface SolutionFeature {
  icon: LucideIcon;
  title: string;
  body: string;
}

export const MARQUEE_ITEMS: string[] = [
  "Workout plans",
  "Meal plans with macros",
  "Daily logging",
  "AI coach",
  "Progress charts",
];

export const SOLUTION_FEATURES: SolutionFeature[] = [
  {
    icon: CalendarDays,
    title: "A week you can see",
    body: "Every day of your program laid out in advance, with today marked. No guessing what comes next.",
  },
  {
    icon: UtensilsCrossed,
    title: "Meals with the numbers",
    body: "Each meal comes with its calories and macros already worked out, so you know what you are eating.",
  },
  {
    icon: ClipboardCheck,
    title: "Logging that takes seconds",
    body: "Tick off what you ate and trained. Skipped and modified count too, because that is what real weeks look like.",
  },
  {
    icon: LineChart,
    title: "Progress you can prove",
    body: "Weight and measurements tracked over time, so the change shows up as a line instead of a feeling.",
  },
];

export const HOW_STEPS: HowStep[] = [
  {
    icon: ClipboardList,
    title: "Get your plan",
    body: "Pick a ready-made program, or ask a coach to build one around your goal. Either way it lands in your week, day by day.",
  },
  {
    icon: LineChart,
    title: "Log what you actually do",
    body: "Every day, mark meals eaten and workouts done, skipped, or modified. Your real history builds up over time.",
  },
  {
    icon: MessageSquareText,
    title: "Ask a coach that knows you",
    body: "The assistant reads your plan and everything you have logged, so the advice fits your week, not a generic one.",
  },
];

export const COACH_QUESTIONS: string[] = [
  "How did I do today?",
  "Can I eat this right now and stay on my plan?",
  "Should I do this workout today, or rest?",
];

export const COACH_CONTEXT_ITEMS: string[] = [
  "Your active program",
  "Meals you logged",
  "Workouts you logged",
  "Your measurements",
];
