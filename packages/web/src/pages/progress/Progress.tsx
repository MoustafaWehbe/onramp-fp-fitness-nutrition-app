import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardCheck,
  LineChart as LineChartIcon,
  Dumbbell,
  Flame,
  Gauge,
  RefreshCw,
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
  type DailyLog,
  type FitnessProgramSummary,
  type MacroBreakdown,
  type MeasurementEntry,
  type WeeklyNutrition,
  type WeeklyWorkoutCompletion,
} from "../../lib/fitness-types";
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
  @media (prefers-reduced-motion: reduce) {
    .dev3-float, .dev3-drift, .dev3-fade-up, .dev3-bar, .dev3-shimmer::after {
      animation: none !important;
      transform: none !important;
    }
    .dev3-card, .dev3-card:hover { transition: none !important; transform: none !important; }
  }
`;
const emptyMeasurement: MeasurementEntry = {
  date: "Not logged",
  weight: 0,
  waist: 0,
  chest: 0,
  hips: 0,
};
const emptyPlan: FitnessProgramSummary = {
  id: "",
  name: "No active program",
  focus: "",
  calorieTarget: 0,
  proteinTarget: 0,
  workoutTargetPerWeek: 0,
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return undefined;
    }

    let frame = 0;
    const start = displayValue;
    const startTime = performance.now();
    const duration = 700;

    function tick(now: number) {
      const progress = clamp((now - startTime) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + (value - start) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reducedMotion]);

  return <>{displayValue.toLocaleString()}{suffix}</>;
}

function ProgressRing({
  value,
  label,
  tone = "cyan",
}: {
  value: number;
  label: string;
  tone?: "cyan" | "violet" | "emerald";
}) {
  const clamped = clamp(value, 0, 100);
  const color = tone === "violet" ? "#8b5cf6" : tone === "emerald" ? "#10b981" : "#06b6d4";

  return (
    <div className="relative grid place-items-center">
      <svg viewBox="0 0 120 120" className="h-28 w-28 -rotate-90">
        <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(226,232,240,.9)" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke={color}
          strokeDasharray={`${clamped * 3.015} 301.5`}
          strokeLinecap="round"
          strokeWidth="12"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-semibold text-slate-950"><AnimatedNumber value={clamped} suffix="%" /></p>
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function FitnessHeroIllustration() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,.24),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(167,139,250,.28),transparent_32%)]" />
      <svg viewBox="0 0 520 360" className="absolute inset-x-0 bottom-0 h-full w-full" role="img" aria-label="Abstract fitness progress illustration">
        <defs>
          <linearGradient id="heroPlate" x1="0" x2="1">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <path d="M60 278 C128 226 168 250 220 198 C282 136 342 164 456 82" fill="none" stroke="url(#heroPlate)" strokeWidth="16" strokeLinecap="round" opacity=".86" />
        <path d="M76 294 C150 242 184 268 238 214 C302 150 360 178 474 100" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity=".42" />
        {[110, 174, 238, 302, 366].map((x, index) => (
          <g key={x} className="dev3-bar" style={{ animationDelay: `${index * 0.12}s` }}>
            <rect x={x} y={250 - index * 24} width="32" height={70 + index * 24} rx="16" fill="rgba(255,255,255,.14)" />
            <rect x={x + 7} y={286 - index * 28} width="18" height={34 + index * 28} rx="9" fill="url(#heroPlate)" />
          </g>
        ))}
        <circle cx="408" cy="90" r="44" fill="rgba(15,23,42,.5)" stroke="rgba(255,255,255,.16)" />
        <path d="M390 90 h36 M408 72 v36" stroke="#67e8f9" strokeWidth="8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function NutritionIllustration() {
  return (
    <svg viewBox="0 0 420 180" className="absolute inset-0 h-full w-full" role="img" aria-label="Nutrition tracking illustration">
      <defs>
        <linearGradient id="nutritionGlow" x1="0" x2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="55%" stopColor="#34d399" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <rect width="420" height="180" fill="#0f172a" />
      <circle cx="112" cy="92" r="58" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.18)" strokeWidth="2" />
      <path d="M112 40 A52 52 0 0 1 164 92 L112 92 Z" fill="#22d3ee" opacity=".9" />
      <path d="M164 92 A52 52 0 0 1 88 139 L112 92 Z" fill="#34d399" opacity=".9" />
      <path d="M88 139 A52 52 0 1 1 112 40 L112 92 Z" fill="#a78bfa" opacity=".86" />
      {[224, 264, 304, 344].map((x, index) => (
        <g key={x} className="dev3-bar" style={{ animationDelay: `${index * 0.16}s` }}>
          <rect x={x} y={54} width="20" height="90" rx="10" fill="rgba(255,255,255,.12)" />
          <rect x={x} y={116 - index * 13} width="20" height={28 + index * 13} rx="10" fill="url(#nutritionGlow)" />
        </g>
      ))}
      <path d="M212 42 H370" stroke="rgba(255,255,255,.18)" strokeWidth="2" strokeLinecap="round" />
      <path d="M212 154 H370" stroke="rgba(255,255,255,.12)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
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
          <circle cx={x(index)} cy={y(item.calories)} r="7" className="fill-white stroke-indigo-500" strokeWidth="3">
            <title>{`${item.week}: ${item.calories} kcal, target ${item.target} kcal`}</title>
          </circle>
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
              >
                <span className="sr-only">{`${item.week}: ${item.completed} of ${item.target} workouts`}</span>
              </div>
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
            >
              <title>{`${item.label}: ${item.grams}g`}</title>
            </circle>
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
  const [progressError, setProgressError] = useState<string | null>(null);
  const [plan, setPlan] = useState<FitnessProgramSummary>(emptyPlan);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [nutritionData, setNutritionData] = useState<WeeklyNutrition[]>([]);
  const [workoutData, setWorkoutData] = useState<WeeklyWorkoutCompletion[]>([]);
  const [macroData, setMacroData] = useState<MacroBreakdown[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementEntry[]>([]);
  const latestMeasurement = measurements[measurements.length - 1];
  const [form, setForm] = useState({
    weight: latestMeasurement?.weight.toString() ?? "",
    waist: latestMeasurement?.waist.toString() ?? "",
    chest: latestMeasurement?.chest.toString() ?? "",
    hips: latestMeasurement?.hips.toString() ?? "",
  });

  function loadSummary(): () => void {
    let cancelled = false;
    setIsLoading(true);
    setProgressError(null);
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
      .catch((error) => {
        if (cancelled) return;
        setDataSource("unavailable");
        setProgressError(
          error instanceof Error
            ? error.message
            : "Unable to load PostgreSQL-backed progress data.",
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }

  useEffect(() => {
    return loadSummary();
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
    const adherence =
      plan.calorieTarget > 0
        ? Math.round(
            clamp(
              100 -
                (Math.abs(averageCalories - plan.calorieTarget) /
                  plan.calorieTarget) *
                  100,
              0,
              100,
            ),
          )
        : 0;

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
      value: stats.currentStreak,
      suffix: " days",
      description: "Training logs in a row",
      icon: Flame,
      accent: "from-orange-400 to-rose-500",
    },
    {
      label: "Plan adherence",
      value: stats.adherence,
      suffix: "%",
      description: "Average calorie target fit",
      icon: ClipboardCheck,
      accent: "from-sky-400 to-indigo-500",
    },
    {
      label: "Workouts completed",
      value: stats.workoutsCompleted,
      suffix: "",
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
          : (progressError ?? "Database-backed progress data is unavailable"),
      icon: Sparkles,
    },
  ];

  function updateField(field: keyof typeof form, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveMeasurementEntry(): void {
    if (dataSource !== "database") {
      setProgressError("Connect the API and PostgreSQL before saving measurements.");
      return;
    }

    const baselineMeasurement = latestMeasurement ?? emptyMeasurement;
    const nextEntry: MeasurementEntry = {
      date: "Today",
      weight: Number(form.weight) || baselineMeasurement.weight,
      waist: Number(form.waist) || baselineMeasurement.waist,
      chest: Number(form.chest) || baselineMeasurement.chest,
      hips: Number(form.hips) || baselineMeasurement.hips,
    };
    void saveFitnessMeasurement({
      weight: nextEntry.weight,
      waist: nextEntry.waist,
      chest: nextEntry.chest,
      hips: nextEntry.hips,
    })
      .then((nextMeasurements) => {
        setProgressError(null);
        setMeasurements(nextMeasurements);
      })
      .catch((error) => {
        setProgressError(
          error instanceof Error
            ? error.message
            : "Unable to save measurement to PostgreSQL.",
        );
      });
  }

  return (
    <div className="relative -m-3 min-h-[calc(100vh-3.5rem)] overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.22),transparent_34%),radial-gradient(circle_at_82%_10%,rgba(168,85,247,0.22),transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_48%,#f8fafc_100%)] p-4 text-slate-950 sm:-m-5 sm:p-6 lg:-m-6 lg:p-8">
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
                Active program: {plan.name}
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
              <FitnessHeroIllustration />
              <div className="absolute inset-0 bg-gradient-to-br from-slate-950/72 via-slate-950/34 to-cyan-950/20" />
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950/85 to-transparent" />
              <div className="relative flex h-full min-h-[21rem] flex-col justify-between p-4 sm:p-5">
                <div className="ml-auto inline-flex w-fit items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-100/10 px-3 py-1.5 text-xs font-semibold text-cyan-50 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,.9)]" />
                  Live coaching signal
                </div>
                <div className="grid gap-3 rounded-3xl border border-white/10 bg-slate-950/45 p-4 backdrop-blur-xl sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Calories target</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {plan.calorieTarget || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Protein target</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {plan.proteinTarget ? `${plan.proteinTarget}g` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Signal</p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-cyan-200">
                      <Gauge className="h-4 w-4" />
                      <AnimatedNumber value={stats.adherence} suffix="% aligned" />
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

        {progressError && (
          <section className="dev3-fade-up rounded-[1.4rem] border border-rose-200 bg-rose-50/90 p-4 text-rose-800 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm">{progressError}</p>
              <Button
                type="button"
                onClick={loadSummary}
                className="w-fit rounded-2xl bg-rose-700 px-4 text-white hover:bg-rose-800"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </div>
          </section>
        )}

        <section className="grid gap-3 md:grid-cols-3">
          <div className={`${mutedPanelClass} dev3-card rounded-[1.5rem] p-4`}>
            <ProgressRing value={stats.adherence} label="adherence" tone="cyan" />
          </div>
          <div className={`${mutedPanelClass} dev3-card rounded-[1.5rem] p-4`}>
            <ProgressRing
              value={
                plan.workoutTargetPerWeek > 0
                  ? Math.round((stats.workoutsCompleted / (plan.workoutTargetPerWeek * 4)) * 100)
                  : 0
              }
              label="4-week training"
              tone="violet"
            />
          </div>
          <div className={`${mutedPanelClass} dev3-card rounded-[1.5rem] p-4`}>
            <ProgressRing
              value={latestMeasurement ? 100 : 0}
              label="body data"
              tone="emerald"
            />
          </div>
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
                      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                        <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                      </p>
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
                    Weekly average intake against {plan.calorieTarget || "-"} kcal/day
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
                <NutritionIllustration />
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
                Saved directly to PostgreSQL for the active program context.
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
                  disabled={dataSource !== "database"}
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
              {progressError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {progressError}
                </div>
              )}
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
