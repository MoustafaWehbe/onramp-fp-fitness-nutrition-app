import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  LineChart as LineChartIcon,
  Dumbbell,
  Flame,
  Gauge,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  getActivePlan,
  getDailyLogs,
  getMeasurements,
  macroBreakdown as fallbackMacroBreakdown,
  saveMeasurements,
  weeklyNutrition as fallbackWeeklyNutrition,
  weeklyWorkoutCompletion as fallbackWeeklyWorkoutCompletion,
  type DailyLog,
  type FitnessPlan,
  type MacroBreakdown,
  type MeasurementEntry,
  type WeeklyNutrition,
  type WeeklyWorkoutCompletion,
} from "../../lib/fitness-mock-data";
import {
  fetchFitnessSummary,
  saveFitnessMeasurement,
} from "../../lib/fitness-api";

const chartHeight = 220;
const chartWidth = 620;
const chartPadding = 34;

const panelClass =
  "border-white/60 bg-white/80 shadow-[0_24px_80px_-45px_rgba(30,41,59,0.55)] backdrop-blur-xl";
const mutedPanelClass = "border-white/50 bg-white/60 backdrop-blur-xl";
const progressHeroImage =
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=82";
const nutritionImage =
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=82";
const motionStyles = `
  @keyframes dev3-float {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    50% { transform: translate3d(16px, -18px, 0) scale(1.04); }
  }
  @keyframes dev3-drift {
    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: .55; }
    50% { transform: translate3d(18px, -26px, 0) rotate(12deg); opacity: .95; }
  }
  @keyframes dev3-fade-up {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dev3-rise {
    from { transform: scaleY(.2); opacity: .45; }
    to { transform: scaleY(1); opacity: 1; }
  }
  @keyframes dev3-shimmer {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }
  .dev3-float { animation: dev3-float 10s ease-in-out infinite; }
  .dev3-drift { animation: dev3-drift 12s ease-in-out infinite; }
  .dev3-fade-up { animation: dev3-fade-up .72s cubic-bezier(.2,.8,.2,1) both; }
  .dev3-card { transition: transform .24s ease, box-shadow .24s ease, border-color .24s ease; }
  .dev3-card:hover { transform: translateY(-4px); box-shadow: 0 28px 80px -46px rgba(15, 23, 42, .92); }
  .dev3-bar { transform-origin: bottom; animation: dev3-rise 1.7s ease-in-out infinite alternate; }
  .dev3-shimmer::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 25%, rgba(255,255,255,.42) 45%, transparent 65%);
    transform: translateX(-120%);
    animation: dev3-shimmer 3.8s ease-in-out infinite;
  }
`;
const emptyMeasurement: MeasurementEntry = {
  date: "Not logged",
  weight: 0,
  waist: 0,
  chest: 0,
  hips: 0,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getCurrentStreak(logs: DailyLog[]): number {
  let streak = 0;

  for (let index = logs.length - 1; index >= 0; index -= 1) {
    if (!logs[index].workoutCompleted) break;
    streak += 1;
  }

  return streak;
}

function LineChart({ data }: { data: WeeklyNutrition[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 text-center text-sm text-slate-500">
        Nutrition logs will appear here once daily logs are saved.
      </div>
    );
  }

  const values = data.flatMap((item) => [item.calories, item.target]);
  const min = Math.min(...values) - 80;
  const max = Math.max(...values) + 80;

  function x(index: number): number {
    if (data.length === 1) return chartWidth / 2;
    return (
      chartPadding +
      (index * (chartWidth - chartPadding * 2)) / (data.length - 1)
    );
  }

  function y(value: number): number {
    return (
      chartHeight -
      chartPadding -
      ((value - min) / (max - min)) * (chartHeight - chartPadding * 2)
    );
  }

  const intakePoints = data
    .map((item, index) => `${x(index)},${y(item.calories)}`)
    .join(" ");
  const targetPoints = data
    .map((item, index) => `${x(index)},${y(item.target)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="h-64 w-full overflow-visible"
      role="img"
      aria-label="Weekly calorie intake compared with target"
    >
      <defs>
        <linearGradient id="calorieLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="55%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {[0, 1, 2].map((line) => {
        const yPosition =
          chartPadding +
          (line * (chartHeight - chartPadding * 2)) / 2;

        return (
          <line
            key={line}
            x1={chartPadding}
            y1={yPosition}
            x2={chartWidth - chartPadding}
            y2={yPosition}
            className="stroke-slate-200/80"
            strokeDasharray="5 8"
          />
        );
      })}
      <line
        x1={chartPadding}
        y1={chartHeight - chartPadding}
        x2={chartWidth - chartPadding}
        y2={chartHeight - chartPadding}
        className="stroke-slate-300/80"
      />
      <polyline
        points={targetPoints}
        fill="none"
        stroke="#94a3b8"
        strokeDasharray="6 6"
        strokeWidth="2.5"
      />
      <polyline
        points={intakePoints}
        fill="none"
        stroke="url(#calorieLine)"
        filter="url(#lineGlow)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {data.map((item, index) => (
        <g key={item.week}>
          <circle cx={x(index)} cy={y(item.calories)} r="7" className="fill-white stroke-indigo-500" strokeWidth="3" />
          <text
            x={x(index)}
            y={chartHeight - 10}
            textAnchor="middle"
            className="fill-slate-500 text-[12px] font-medium"
          >
            {item.week}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: WeeklyWorkoutCompletion[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 text-center text-sm text-slate-500">
        Workout completion appears here after workouts are logged.
      </div>
    );
  }

  return (
    <div className="flex h-64 items-end gap-3 sm:gap-4">
      {data.map((item) => {
        const rate = Math.round((item.completed / item.target) * 100);

        return (
          <div key={item.week} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-b from-slate-100 to-white p-1 shadow-inner">
              <div
                className="w-full rounded-2xl bg-gradient-to-t from-indigo-600 via-sky-500 to-cyan-300 shadow-[0_18px_35px_-18px_rgba(79,70,229,0.9)] transition-all"
                style={{ height: `${clamp(rate, 8, 100)}%` }}
                aria-label={`${item.week} workout completion ${rate}%`}
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-slate-900">{rate}%</div>
              <div className="text-xs text-slate-500">{item.week}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MacroDonut({ data }: { data: MacroBreakdown[] }) {
  const total = data.reduce((sum, item) => sum + item.grams, 0);
  let offset = 0;

  if (data.length === 0 || total === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8 text-center text-sm text-slate-500">
        Macro totals will appear after a daily nutrition log is saved.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
      <div className="relative mx-auto">
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-sky-100 via-white to-violet-100 blur-xl" />
        <svg viewBox="0 0 120 120" className="relative h-44 w-44" role="img">
        <circle cx="60" cy="60" r="44" fill="none" className="stroke-slate-100" strokeWidth="18" />
        {data.map((item) => {
          const percent = item.grams / total;
          const dash = `${percent * 276.46} 276.46`;
          const currentOffset = offset;
          offset += percent * 276.46;

          return (
            <circle
              key={item.label}
              cx="60"
              cy="60"
              r="44"
              fill="none"
              stroke={item.color}
              strokeDasharray={dash}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              strokeWidth="18"
              transform="rotate(-90 60 60)"
            />
          );
        })}
        <text x="60" y="56" textAnchor="middle" className="fill-foreground text-[16px] font-bold">
          {total}g
        </text>
        <text x="60" y="72" textAnchor="middle" className="fill-slate-500 text-[10px]">
          logged
        </text>
        </svg>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600">{item.label}</span>
            </div>
            <span className="font-semibold text-slate-950">{item.grams}g</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasurementTrend({ data }: { data: MeasurementEntry[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 px-6 text-center text-sm text-slate-500">
        Body measurement trends will appear after the first saved entry.
      </div>
    );
  }

  const values = data.flatMap((item) => [item.weight, item.waist]);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;

  function x(index: number): number {
    if (data.length === 1) return chartWidth / 2;
    return (
      chartPadding +
      (index * (chartWidth - chartPadding * 2)) / (data.length - 1)
    );
  }

  function y(value: number): number {
    return (
      chartHeight -
      chartPadding -
      ((value - min) / (max - min)) * (chartHeight - chartPadding * 2)
    );
  }

  const weightPoints = data.map((item, index) => `${x(index)},${y(item.weight)}`).join(" ");
  const waistPoints = data.map((item, index) => `${x(index)},${y(item.waist)}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      className="h-64 w-full overflow-visible"
      role="img"
      aria-label="Body measurement trends"
    >
      <defs>
        <linearGradient id="weightLine" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <line
        x1={chartPadding}
        y1={chartHeight - chartPadding}
        x2={chartWidth - chartPadding}
        y2={chartHeight - chartPadding}
        className="stroke-slate-300/80"
      />
      <polyline
        points={weightPoints}
        fill="none"
        stroke="url(#weightLine)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <polyline
        points={waistPoints}
        fill="none"
        stroke="#14b8a6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {data.map((item, index) => (
        <text
          key={item.date}
          x={x(index)}
          y={chartHeight - 10}
          textAnchor="middle"
          className="fill-slate-500 text-[12px]"
        >
          {item.date}
        </text>
      ))}
    </svg>
  );
}

export function Progress() {
  const [dataSource, setDataSource] = useState<"database" | "unavailable">(
    "unavailable",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<FitnessPlan>(() => getActivePlan());
  const [logs, setLogs] = useState<DailyLog[]>(() => getDailyLogs());
  const [nutritionData, setNutritionData] = useState<WeeklyNutrition[]>(
    () => fallbackWeeklyNutrition,
  );
  const [workoutData, setWorkoutData] = useState<WeeklyWorkoutCompletion[]>(
    () => fallbackWeeklyWorkoutCompletion,
  );
  const [macroData, setMacroData] = useState<MacroBreakdown[]>(
    () => fallbackMacroBreakdown,
  );
  const [measurements, setMeasurements] = useState(() => getMeasurements());
  const latestMeasurement = measurements[measurements.length - 1];
  const [form, setForm] = useState({
    weight: latestMeasurement?.weight.toString() ?? "",
    waist: latestMeasurement?.waist.toString() ?? "",
    chest: latestMeasurement?.chest.toString() ?? "",
    hips: latestMeasurement?.hips.toString() ?? "",
  });

  useEffect(() => {
    let cancelled = false;

    fetchFitnessSummary()
      .then((summary) => {
        if (cancelled) return;
        setDataSource("database");
        setPlan(summary.activePlan);
        setLogs(summary.dailyLogs);
        setNutritionData(summary.weeklyNutrition);
        setWorkoutData(summary.weeklyWorkoutCompletion);
        setMacroData(summary.macroBreakdown);
        setMeasurements(summary.measurements);
      })
      .catch(() => {
        // Keep the page usable for local demos only when the API/database is unavailable.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setForm({
      weight: latestMeasurement?.weight.toString() ?? "",
      waist: latestMeasurement?.waist.toString() ?? "",
      chest: latestMeasurement?.chest.toString() ?? "",
      hips: latestMeasurement?.hips.toString() ?? "",
    });
  }, [latestMeasurement]);

  const stats = useMemo(() => {
    const workoutsCompleted = workoutData.reduce(
      (sum, item) => sum + item.completed,
      0,
    );
    const averageCalories =
      logs.length > 0
        ? logs.reduce((sum, log) => sum + log.calories, 0) / logs.length
        : plan.calorieTarget;
    const adherence = Math.round(
      clamp(100 - (Math.abs(averageCalories - plan.calorieTarget) / plan.calorieTarget) * 100, 0, 100),
    );

    return {
      currentStreak: getCurrentStreak(logs),
      adherence,
      workoutsCompleted,
      averageCalories: Math.round(averageCalories),
      calorieDelta: Math.round(averageCalories - plan.calorieTarget),
    };
  }, [logs, plan.calorieTarget, workoutData]);

  const latestLog = logs[logs.length - 1];

  const statCards = [
    {
      label: "Current streak",
      value: `${stats.currentStreak} days`,
      description: "Training logs in a row",
      icon: Flame,
      accent: "from-orange-400 to-rose-500",
    },
    {
      label: "Plan adherence",
      value: `${stats.adherence}%`,
      description: "Average calorie target fit",
      icon: ClipboardCheck,
      accent: "from-sky-400 to-indigo-500",
    },
    {
      label: "Workouts completed",
      value: stats.workoutsCompleted.toString(),
      description: "Across the last 4 weeks",
      icon: Dumbbell,
      accent: "from-violet-500 to-fuchsia-500",
    },
  ];

  const progressInsights = [
    {
      label: "Nutrition drift",
      value:
        stats.calorieDelta === 0
          ? "On target"
          : `${Math.abs(stats.calorieDelta)} kcal ${stats.calorieDelta > 0 ? "over" : "under"}`,
      detail: `${stats.averageCalories} kcal average from recent logs`,
      icon: Gauge,
    },
    {
      label: "Latest log",
      value: latestLog ? `${latestLog.calories} kcal` : "No log yet",
      detail: latestLog?.note ?? "Connect daily logs to see your latest signal.",
      icon: CalendarDays,
    },
    {
      label: "Coach signal",
      value: stats.adherence >= 90 ? "Strong alignment" : "Needs tuning",
      detail:
        dataSource === "database"
          ? "Generated from shared database plan and logs"
          : "Database unavailable; showing local demo data",
      icon: Sparkles,
    },
  ];

  function updateField(field: keyof typeof form, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveMeasurementEntry(): void {
    const fallbackMeasurement = latestMeasurement ?? emptyMeasurement;
    const nextEntry: MeasurementEntry = {
      date: "Today",
      weight: Number(form.weight) || fallbackMeasurement.weight,
      waist: Number(form.waist) || fallbackMeasurement.waist,
      chest: Number(form.chest) || fallbackMeasurement.chest,
      hips: Number(form.hips) || fallbackMeasurement.hips,
    };
    const nextMeasurements = [...measurements.slice(-5), nextEntry];
    setMeasurements(nextMeasurements);
    saveMeasurements(nextMeasurements);
    void saveFitnessMeasurement({
      weight: nextEntry.weight,
      waist: nextEntry.waist,
      chest: nextEntry.chest,
      hips: nextEntry.hips,
    }).then(setMeasurements).catch(() => undefined);
  }

  return (
    <div className="relative -m-6 min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(168,85,247,0.22),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] p-4 text-slate-950 sm:p-6 lg:p-8">
      <style>{motionStyles}</style>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/70 to-transparent" />
      <div className="dev3-float pointer-events-none absolute left-[-5rem] top-20 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="dev3-float pointer-events-none absolute right-[-6rem] top-64 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl [animation-delay:-3s]" />
      <div className="dev3-float pointer-events-none absolute bottom-20 left-1/2 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl [animation-delay:-6s]" />
      <div className="dev3-drift pointer-events-none absolute left-[18%] top-36 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_26px_rgba(103,232,249,.9)]" />
      <div className="dev3-drift pointer-events-none absolute right-[18%] top-24 h-3 w-3 rounded-full bg-violet-300 shadow-[0_0_30px_rgba(196,181,253,.9)] [animation-delay:-5s]" />
      <div className="dev3-drift pointer-events-none absolute bottom-40 right-[34%] h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_24px_rgba(147,197,253,.85)] [animation-delay:-8s]" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6">
        <section className="dev3-fade-up dev3-shimmer relative overflow-hidden rounded-[2rem] border border-white/60 bg-slate-950 px-5 py-6 text-white shadow-[0_30px_100px_-45px_rgba(15,23,42,0.9)] sm:px-8 sm:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(56,189,248,0.32),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(168,85,247,0.30),transparent_34%)]" />
          <div className="relative grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-sky-100 backdrop-blur">
                <Target className="h-4 w-4" />
                Active plan: {plan.name}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-medium text-cyan-100 backdrop-blur sm:ml-2">
                <span className={`h-2 w-2 rounded-full ${dataSource === "database" ? "bg-emerald-300" : "bg-amber-300"} ${isLoading ? "animate-pulse" : ""}`} />
                {isLoading
                  ? "Syncing data"
                  : dataSource === "database"
                    ? "PostgreSQL live"
                    : "Database unavailable"}
              </div>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  Progress intelligence for your coaching plan.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Track adherence, training consistency, nutrition, and body trends with a calmer dashboard built for quick decisions.
                </p>
              </div>
            </div>
            <div className="dev3-float relative min-h-[21rem] overflow-hidden rounded-[1.8rem] border border-white/15 bg-white/10 shadow-[0_28px_90px_-46px_rgba(14,165,233,0.9)] backdrop-blur-md [animation-duration:14s]">
              <img
                src={progressHeroImage}
                alt="Athlete training in a modern gym"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/78 via-slate-950/48 to-cyan-950/30" />
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/85 to-transparent" />
              <div className="relative flex h-full min-h-[21rem] flex-col justify-between p-4 sm:p-5">
                <div className="ml-auto inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/10 px-3 py-1.5 text-xs font-semibold text-cyan-50 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.9)]" />
                  Live coaching signal
                </div>
                <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/45 p-4 backdrop-blur-xl sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Calories target</p>
                    <p className="mt-1 text-2xl font-semibold">{plan.calorieTarget}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Protein target</p>
                    <p className="mt-1 text-2xl font-semibold">{plan.proteinTarget}g</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signal</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                      <Gauge className="h-4 w-4" />
                      {stats.adherence}% aligned
                    </p>
                  </div>
                </div>
                <div className="absolute left-4 top-4 grid h-24 w-28 grid-cols-5 items-end gap-1 rounded-3xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
                  {[44, 68, 52, 86, 72].map((height, index) => (
                    <span
                      key={height}
                      className="dev3-bar rounded-full bg-gradient-to-t from-cyan-300 to-violet-300"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${index * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {progressInsights.map((insight, index) => {
            const Icon = insight.icon;

            return (
              <div
                key={insight.label}
                className="dev3-card dev3-fade-up group relative overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/70 p-4 shadow-[0_18px_55px_-42px_rgba(15,23,42,0.9)] backdrop-blur-xl"
                style={{ animationDelay: `${0.08 + index * 0.07}s` }}
              >
                <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent" />
                <div className="relative flex items-start gap-3">
                  <div className="rounded-2xl bg-slate-950 p-3 text-cyan-200 shadow-lg shadow-slate-950/15 transition-transform group-hover:-translate-y-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                      {insight.label}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {insight.value}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                      {insight.detail}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <div className="grid gap-4 md:grid-cols-3">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <Card
                key={stat.label}
                className={`${panelClass} dev3-card dev3-fade-up overflow-hidden rounded-[1.5rem]`}
                style={{ animationDelay: `${0.18 + index * 0.08}s` }}
              >
                <CardContent className="relative p-5">
                  <div className={`absolute -right-8 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${stat.accent} opacity-20 blur-2xl`} />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{stat.value}</p>
                      <p className="mt-1 text-sm text-slate-500">{stat.description}</p>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full bg-gradient-to-r ${stat.accent}`} style={{ width: stat.label === "Workouts completed" ? "88%" : "100%" }} />
                      </div>
                    </div>
                    <div className={`rounded-2xl bg-gradient-to-br ${stat.accent} p-3 text-white shadow-lg shadow-indigo-500/20`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className={`${panelClass} dev3-card dev3-fade-up rounded-[1.75rem]`} style={{ animationDelay: "0.36s" }}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-950">Calories vs target</CardTitle>
                  <CardDescription className="mt-2 text-slate-500">
                    Weekly average intake against {plan.calorieTarget} kcal/day
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
                  <LineChartIcon className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <LineChart data={nutritionData} />
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-8 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-violet-500" /> Intake
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-0.5 w-8 border-t border-dashed border-slate-400" /> Target
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`${panelClass} dev3-card dev3-fade-up rounded-[1.75rem]`} style={{ animationDelay: "0.42s" }}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-slate-950">Workout completion rate</CardTitle>
                  <CardDescription className="mt-2 text-slate-500">
                    Completed sessions divided by weekly goal
                  </CardDescription>
                </div>
                <div className="rounded-2xl bg-violet-100 p-3 text-violet-700">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BarChart data={workoutData} />
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <Card className={`${panelClass} dev3-card dev3-fade-up rounded-[1.75rem]`} style={{ animationDelay: "0.48s" }}>
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">Macro breakdown</CardTitle>
              <CardDescription className="mt-2 text-slate-500">Latest logged day by grams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="relative min-h-36 overflow-hidden rounded-3xl border border-white/70 shadow-inner">
                <img
                  src={nutritionImage}
                  alt="Balanced meal ingredients for nutrition tracking"
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/72 via-slate-950/28 to-transparent" />
                <div className="relative max-w-xs p-4 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">Nutrition layer</p>
                  <p className="mt-2 text-sm leading-5 text-slate-100">
                    Macro signals pair meal logs with your active coaching target.
                  </p>
                </div>
              </div>
              <MacroDonut data={macroData} />
            </CardContent>
          </Card>

          <Card className={`${panelClass} dev3-card dev3-fade-up rounded-[1.75rem]`} style={{ animationDelay: "0.54s" }}>
            <CardHeader>
              <CardTitle className="text-xl text-slate-950">Body measurements</CardTitle>
              <CardDescription className="mt-2 text-slate-500">
                Saved to PostgreSQL when available; local demo storage is used only without the API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {(["weight", "waist", "chest", "hips"] as const).map((field) => (
                  <label key={field} className="space-y-2 text-sm">
                    <span className="font-medium capitalize text-slate-600">{field}</span>
                    <Input
                      value={form[field]}
                      onChange={(event) => updateField(field, event.target.value)}
                      className="rounded-2xl border-slate-200 bg-white/80 shadow-inner"
                    />
                  </label>
                ))}
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  onClick={saveMeasurementEntry}
                  className="rounded-2xl bg-slate-950 px-5 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Save measurement
                </Button>
                <div className={`${mutedPanelClass} rounded-2xl px-4 py-2 text-sm text-slate-600`}>
                  Latest weight:{" "}
                  <span className="font-semibold text-slate-950">
                    {latestMeasurement ? latestMeasurement.weight : "Not logged"}
                  </span>
                </div>
              </div>
              <MeasurementTrend data={measurements} />
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-8 rounded-full bg-gradient-to-r from-blue-600 to-violet-600" /> Weight
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-8 rounded-full bg-teal-500" /> Waist
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
