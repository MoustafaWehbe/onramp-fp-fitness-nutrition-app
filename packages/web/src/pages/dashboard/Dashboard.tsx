import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Dumbbell,
  Gauge,
  RefreshCw,
  Sparkles,
  Target,
  Utensils,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { ROUTES } from "../../constants/routes";
import { useAuth } from "../../hooks/useAuth";
import { useActiveProgram } from "../../hooks/useProgram";
import { useDayPlanDetail } from "../../hooks/useDayPlanDetail";
import {
  fetchFitnessSummary,
  type FitnessSummary,
} from "../../lib/fitness-api";
import type { DailyLog } from "../../lib/fitness-types";

const motionStyles = `
  @keyframes dashboardFloat {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -10px, 0); }
  }
  @keyframes dashboardRise {
    from { opacity: 0; transform: translateY(14px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dashboardPulse {
    0%, 100% { opacity: .55; transform: scale(.96); }
    50% { opacity: 1; transform: scale(1.04); }
  }
  .dashboard-rise { animation: dashboardRise .55s cubic-bezier(.2,.8,.2,1) both; }
  .dashboard-float { animation: dashboardFloat 8s ease-in-out infinite; }
  .dashboard-pulse { animation: dashboardPulse 3s ease-in-out infinite; }
  @media (prefers-reduced-motion: reduce) {
    .dashboard-rise, .dashboard-float, .dashboard-pulse {
      animation: none !important;
      transform: none !important;
    }
  }
`;

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatDay(value?: string): string {
  if (!value) return "No date";
  return new Date(value).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function latestLog(logs: DailyLog[]): DailyLog | null {
  return logs.length > 0 ? logs[logs.length - 1] : null;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-72 animate-pulse rounded-[2rem] bg-slate-200/70" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-[1.5rem] bg-slate-200/70"
          />
        ))}
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const {
    program,
    dayPlans,
    isLoading: programLoading,
    error: programError,
  } = useActiveProgram();
  const [summary, setSummary] = useState<FitnessSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const activeDayPlanSummary = useMemo(() => {
    if (!program || dayPlans.length === 0) return null;
    return dayPlans[program.currentDay - 1] ?? dayPlans[0] ?? null;
  }, [dayPlans, program]);

  const {
    dayPlan,
    isLoading: dayPlanLoading,
    error: dayPlanError,
  } = useDayPlanDetail(activeDayPlanSummary?.id ?? null);

  function loadSummary(): void {
    setSummaryLoading(true);
    setSummaryError(null);
    fetchFitnessSummary()
      .then(setSummary)
      .catch(() => {
        setSummary(null);
        setSummaryError("Fitness summary could not be loaded from PostgreSQL.");
      })
      .finally(() => setSummaryLoading(false));
  }

  useEffect(() => {
    loadSummary();
  }, []);

  const loading = programLoading || summaryLoading || dayPlanLoading;
  const error = programError ?? summaryError ?? dayPlanError;
  const recentLog = summary ? latestLog(summary.dailyLogs) : null;
  const completedWorkouts =
    summary?.dailyLogs.filter((log) => log.workoutCompleted).length ?? 0;
  const averageCalories = Math.round(
    average(summary?.dailyLogs.map((log) => log.calories) ?? []),
  );
  const calorieTarget = summary?.activePlan.calorieTarget ?? program?.calories ?? 0;
  const calorieAlignment =
    calorieTarget > 0 && averageCalories > 0
      ? Math.max(
          0,
          Math.round(100 - (Math.abs(averageCalories - calorieTarget) / calorieTarget) * 100),
        )
      : 0;
  const loggedMeals =
    dayPlan?.meals.filter((meal) =>
      summary?.dailyLogs.some((log) => log.date === dayPlan.date && log.calories >= meal.totalCalories),
    ).length ?? 0;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="relative -m-3 min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[radial-gradient(circle_at_15%_0%,rgba(45,212,191,.22),transparent_32%),radial-gradient(circle_at_84%_6%,rgba(99,102,241,.18),transparent_28%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] p-4 text-slate-950 sm:-m-5 sm:p-6 lg:-m-6 lg:p-8">
      <style>{motionStyles}</style>
      <div className="dashboard-float pointer-events-none absolute -left-20 top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="dashboard-float pointer-events-none absolute -right-24 top-48 h-72 w-72 rounded-full bg-indigo-300/20 blur-3xl [animation-delay:-3s]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-5">
        <section className="dashboard-rise relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 p-6 text-white shadow-[0_32px_100px_-48px_rgba(15,23,42,.9)] sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,.30),transparent_28%),radial-gradient(circle_at_88%_10%,rgba(167,139,250,.30),transparent_34%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-cyan-50 backdrop-blur">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  PostgreSQL live dashboard
                </span>
                {program && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-indigo-50 backdrop-blur">
                    <Target className="h-4 w-4 text-indigo-200" />
                    Week {program.currentWeek} of {program.weeks}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.24em] text-cyan-100/80">
                  Welcome back, {user?.name ?? "Coach"}
                </p>
                <h1 className="mt-3 max-w-3xl break-words text-3xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  FitCoach AI command center
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                  Your active program, today&apos;s plan, progress signals, and
                  coaching context are all loaded from PostgreSQL.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to={ROUTES.dailyLog}
                  className="inline-flex h-10 items-center justify-center rounded-2xl bg-cyan-300 px-5 text-sm font-medium text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200"
                >
                  Log today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  to={ROUTES.aiAssistant}
                  className="inline-flex h-10 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  Ask AI coach
                  <Bot className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="relative min-h-[18rem] overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_24%,rgba(125,211,252,.32),transparent_30%),radial-gradient(circle_at_72%_72%,rgba(196,181,253,.28),transparent_30%)]" />
              <svg viewBox="0 0 520 260" className="dashboard-float relative h-full w-full" role="img" aria-label="Inclusive fitness and nutrition progress illustration">
                <defs>
                  <linearGradient id="dashLine" x1="0" x2="1">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
                <path d="M58 184 C126 92 204 212 282 122 C346 48 414 70 468 40" fill="none" stroke="url(#dashLine)" strokeWidth="12" strokeLinecap="round" opacity=".85" />
                <circle cx="104" cy="170" r="36" fill="rgba(255,255,255,.12)" stroke="rgba(255,255,255,.22)" />
                <circle cx="104" cy="170" r="14" fill="#67e8f9" />
                <rect x="300" y="142" width="160" height="72" rx="28" fill="rgba(15,23,42,.42)" stroke="rgba(255,255,255,.18)" />
                {[0, 1, 2, 3].map((bar) => (
                  <rect
                    key={bar}
                    x={330 + bar * 24}
                    y={184 - bar * 14}
                    width="14"
                    height={28 + bar * 14}
                    rx="7"
                    fill={bar % 2 ? "#a78bfa" : "#67e8f9"}
                    opacity=".9"
                  />
                ))}
                <circle className="dashboard-pulse" cx="416" cy="72" r="38" fill="rgba(34,211,238,.16)" stroke="rgba(103,232,249,.48)" />
                <path d="M400 72 h32 M416 56 v32" stroke="#67e8f9" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </section>

        {error && (
          <Card className="border-amber-200 bg-amber-50/90">
            <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-amber-900">{error}</p>
              <Button type="button" onClick={loadSummary} variant="outline" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Active program",
              value: program?.title ?? "No program",
              detail: program ? `${program.goal} / ${program.calories} kcal` : "Enroll in a real plan",
              icon: Target,
            },
            {
              label: "Today's meals",
              value: dayPlan ? `${loggedMeals}/${dayPlan.meals.length}` : "No day",
              detail: dayPlan ? `${formatDay(dayPlan.date)} plan items` : "No plan available",
              icon: Utensils,
            },
            {
              label: "Training logs",
              value: `${completedWorkouts}/${summary?.dailyLogs.length ?? 0}`,
              detail: "Completed workouts from saved logs",
              icon: Dumbbell,
            },
            {
              label: "Calorie signal",
              value: calorieAlignment ? `${calorieAlignment}%` : "No logs",
              detail: averageCalories ? `${averageCalories} kcal average` : "Save meals to calculate",
              icon: Gauge,
            },
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={stat.label}
                className="dashboard-rise border-white/70 bg-white/80 shadow-[0_20px_70px_-46px_rgba(15,23,42,.85)] backdrop-blur-xl"
                style={{ animationDelay: `${0.08 + index * 0.05}s` }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {stat.label}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">{stat.detail}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-200">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
          <Card className="dashboard-rise border-white/70 bg-white/85 shadow-[0_24px_80px_-50px_rgba(15,23,42,.88)] backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Today&apos;s plan</CardTitle>
              <CardDescription>
                Real meals and workout loaded from the active DayPlan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dayPlan ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="font-heading text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        {dayPlan.label}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-950">
                        {formatDay(dayPlan.date)}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                      {dayPlan.isRestDay ? "Recovery day" : "Training day"}
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {dayPlan.meals.slice(0, 4).map((meal) => (
                      <div key={meal.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          {meal.type}
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-950">
                          {meal.items.map((item) => item.name).join(", ")}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {meal.totalCalories} kcal / {meal.totalProtein}g protein
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                    {dayPlan.workout ? (
                      <div className="flex items-start gap-3">
                        <Dumbbell className="mt-1 h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-slate-950">
                            {dayPlan.workout.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {dayPlan.workout.exercises.length} exercises / {dayPlan.workout.duration}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <Activity className="mt-1 h-5 w-5 text-indigo-600" />
                        <div>
                          <p className="font-semibold text-slate-950">No workout scheduled</p>
                          <p className="mt-1 text-sm text-slate-600">
                            Use the day for recovery, walking, or mobility.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                  No active DayPlan is available yet.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-5">
            <Card className="dashboard-rise border-white/70 bg-white/85 shadow-[0_24px_80px_-50px_rgba(15,23,42,.88)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Latest activity</CardTitle>
                <CardDescription>
                  Summarized from saved MealLog and WorkoutLog records.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentLog ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <span className="text-sm text-slate-500">Date</span>
                      <span className="font-medium text-slate-950">
                        {formatDay(recentLog.date)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Calories</p>
                        <p className="mt-2 text-2xl font-semibold">{recentLog.calories}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Protein</p>
                        <p className="mt-2 text-2xl font-semibold">{recentLog.protein}g</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                      <CheckCircle2 className="mt-0.5 h-4 w-4" />
                      {recentLog.workoutCompleted
                        ? "Workout completed on the latest logged day."
                        : "No completed workout on the latest logged day."}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                    No daily logs yet. Save today&apos;s meals or workout to
                    light up this panel.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="dashboard-rise border-white/70 bg-white/85 shadow-[0_24px_80px_-50px_rgba(15,23,42,.88)] backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Next actions</CardTitle>
                <CardDescription>Jump into the highest-value workflows.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  { to: ROUTES.myPlan, label: "Review plan", icon: CalendarDays },
                  { to: ROUTES.dailyLog, label: "Save daily log", icon: ClipboardList },
                  { to: ROUTES.progress, label: "Check progress", icon: Activity },
                  { to: ROUTES.aiAssistant, label: "Ask AI coach", icon: Bot },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.to}
                      to={action.to}
                      className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:text-slate-950 hover:shadow-lg"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-cyan-600" />
                        {action.label}
                      </span>
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
