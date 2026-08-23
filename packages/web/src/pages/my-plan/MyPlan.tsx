import { useState, useEffect } from "react";
import { useActiveProgram } from "../../hooks/useProgram";
import { useDayPlanDetail } from "../../hooks/useDayPlanDetail";
import { useDayLogs } from "../../hooks/useDayLogs";
import type { ApiDayPlanSummary, ApiDayPlanDetail, ApiMeal } from "../../lib/api-types";
import { Card, CardContent } from "../../components/ui/card";
import {
  Sunrise, Apple, Salad, Moon, Utensils, NotebookPen, ChevronDown,
  Dumbbell, Activity, Flower2, BedDouble, Flame, Beef, Wheat, Droplet,
  type LucideIcon,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_ICONS: Record<string, LucideIcon> = {
  breakfast: Sunrise,
  snack: Apple,
  lunch: Salad,
  dinner: Moon,
};

const MUSCLE_STYLE = "bg-secondary text-secondary-foreground border border-border";

const WORKOUT_TYPE_STYLE: Record<string, { bg: string; text: string; border: string; icon: LucideIcon }> = {
  Strength: { bg: "bg-primary", text: "text-primary-foreground", border: "border-primary", icon: Dumbbell },
  Cardio: { bg: "bg-secondary", text: "text-secondary-foreground", border: "border-border", icon: Activity },
  Mobility: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: Flower2 },
};

function getMealSnackLabel(meal: ApiMeal, index: number, allMeals: ApiMeal[]): string {
  if (meal.type !== "snack") return meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
  const snackIndex = allMeals.filter((m) => m.type === "snack").indexOf(meal);
  return `Snack ${snackIndex + 1}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressRing({
  value, size = 56, stroke = 4, color = "hsl(var(--primary))",
}: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--border))" strokeWidth={stroke} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
}

function MacroBar({ label, value, max, icon: Icon }: { label: string; value: number; max: number; icon: LucideIcon }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground font-medium">
          <Icon className="w-3 h-3" /> {label}
        </span>
        <span className="text-foreground font-semibold">{value}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// DayNavButton now receives log status from the parent (fetched via API)
function DayNavButton({
  day, selected, onClick, workoutStatus,
}: {
  day: ApiDayPlanSummary;
  selected: boolean;
  onClick: () => void;
  workoutStatus: string | null;
}) {
  const isToday = day.date === new Date().toISOString().slice(0, 10);
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] border ${
        selected ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-card text-card-foreground border-border hover:bg-secondary"
      }`}
    >
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${selected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
        {day.label.slice(0, 3)}
      </span>
      <span className={`text-sm font-bold ${selected ? "text-primary-foreground" : "text-card-foreground"}`}>
        {parseInt(day.date.split("-")[2])}
      </span>
      {day.isRestDay ? (
        <span className={`text-[9px] font-medium ${selected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>Rest</span>
      ) : workoutStatus === "completed" ? (
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
      ) : workoutStatus === "skipped" ? (
        <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-primary-foreground/50" : "bg-border"}`} />
      )}
      {isToday && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
      )}
    </button>
  );
}

function MealCard({ meal, index, allMeals }: { meal: ApiMeal; index: number; allMeals: ApiMeal[] }) {
  const [expanded, setExpanded] = useState(false);
  const label = getMealSnackLabel(meal, index, allMeals);
  const Icon = MEAL_ICONS[meal.type] ?? Utensils;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-card-foreground text-sm">{label}</p>
            <span className="text-xs text-muted-foreground">{meal.time}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {meal.items.map((i) => i.name).join(" · ")}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-card-foreground">{meal.totalCalories}</p>
          <p className="text-[10px] text-muted-foreground">kcal</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground ml-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
          <div className="space-y-2">
            {meal.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-card-foreground">{item.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">{item.quantity}</span>
                </div>
                <span className="text-card-foreground font-semibold">{item.calories} kcal</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
            <MacroBar label="Protein" value={meal.totalProtein} max={60} icon={Beef} />
            <MacroBar label="Carbs" value={meal.totalCarbs} max={80} icon={Wheat} />
            <MacroBar label="Fat" value={meal.totalFat} max={40} icon={Droplet} />
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ day }: { day: ApiDayPlanDetail }) {
  const [expanded, setExpanded] = useState(false);
  if (!day.workout) return null;
  const { workout } = day;
  const style = WORKOUT_TYPE_STYLE[workout.type] ?? WORKOUT_TYPE_STYLE["Strength"];
  const TypeIcon = style.icon;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
            <TypeIcon className={`w-5 h-5 ${style.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-card-foreground text-sm">{workout.name}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                {workout.type}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {workout.exercises.length} exercises · {workout.duration}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <div className="space-y-2">
            {workout.exercises.map((ex, i) => (
              <div key={ex.id} className="flex items-start justify-between gap-2 text-sm py-2 border-b border-border last:border-0">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-secondary text-secondary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-card-foreground">{ex.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps}</span>
                      <span className="text-xs text-muted-foreground">Rest {ex.rest}</span>
                      {ex.notes && <span className="text-xs text-primary italic">{ex.notes}</span>}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${MUSCLE_STYLE}`}>
                  {ex.muscle}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function MyPlan() {
  const { program, dayPlans, isLoading: programLoading, error } = useActiveProgram();
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"meals" | "workout">("meals");

  // Once program loads, default to currentDay
  useEffect(() => {
    if (program) setActiveDayIndex(program.currentDay - 1);
  }, [program]);

  const activeDayPlanSummary = dayPlans[activeDayIndex];

  // Fetch full detail for the selected day
  const { dayPlan: day, isLoading: dayLoading } = useDayPlanDetail(
    activeDayPlanSummary?.id ?? null
  );

  // Fetch logs for the selected day (for the dot indicators on DayNavButton)
  const { workoutLog } = useDayLogs(activeDayPlanSummary?.id ?? null);

  if (programLoading) return <p className="text-muted-foreground">Loading program...</p>;

  if (error) return <p className="text-destructive">Failed to load program.</p>;

  if (!program) {
    return (
      <div className="mx-auto max-w-md space-y-4 p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-secondary">
          <NotebookPen className="h-6 w-6 text-secondary-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground">No plan yet</h2>
        <p className="text-sm text-muted-foreground">
          You don't have a plan assigned yet. Request a coach and they'll build a personalized workout and meal plan for you.
        </p>
        <a
          href="/request-coach"
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          Request a Coach
        </a>
      </div>
    );
  }

  const progressPct = Math.round((program.completedDays / program.totalDays) * 100);

  return (
    <div className="space-y-6">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">My Plan</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Week {program.currentWeek} of {program.weeks}</p>
        </div>
        <a href="/daily-log" className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm">
          <NotebookPen className="w-4 h-4" /> Log Today
        </a>
      </div>

      {/* ── Program Card ── */}
      <Card className="border border-border shadow-sm bg-primary text-primary-foreground overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold bg-primary-foreground/20 px-2 py-0.5 rounded-full">{program.goal}</span>
                <span className="text-xs text-primary-foreground/70">{program.level}</span>
              </div>
              <h2 className="text-lg font-bold leading-tight">{program.title}</h2>
              <p className="text-primary-foreground/70 text-sm mt-0.5">{program.duration} · {program.calories} kcal/day target</p>
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-primary-foreground/70">
                  <span>Overall progress</span>
                  <span className="font-semibold text-primary-foreground">{progressPct}% · Day {program.completedDays}/{program.totalDays}</span>
                </div>
                <div className="h-2 rounded-full bg-primary-foreground/20 overflow-hidden">
                  <div className="h-full rounded-full bg-primary-foreground transition-all duration-700" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <ProgressRing value={program.adherenceRate} size={72} stroke={5} color="hsl(var(--primary-foreground))" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black leading-none">{program.adherenceRate}%</span>
                <span className="text-[9px] text-primary-foreground/70 mt-0.5">adherence</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Day Selector ── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {dayPlans.map((d, i) => (
          <DayNavButton
            key={d.id}
            day={d}
            selected={i === activeDayIndex}
            onClick={() => { setActiveDayIndex(i); setActiveTab("meals"); }}
            workoutStatus={i === activeDayIndex ? (workoutLog?.status ?? null) : null}
          />
        ))}
      </div>

      {/* ── Day detail (loading state) ── */}
      {dayLoading || !day ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Selected Day Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-foreground">{day.label}</h3>
              <p className="text-sm text-muted-foreground">
                {new Date(day.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
            {day.isRestDay ? (
              <span className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-sm font-semibold px-3 py-1.5 rounded-xl">
                <BedDouble className="w-4 h-4" /> Rest Day
              </span>
            ) : workoutLog ? (
              <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl ${
                workoutLog.status === "completed" ? "bg-primary text-primary-foreground"
                : workoutLog.status === "skipped" ? "bg-destructive text-destructive-foreground"
                : "bg-accent text-accent-foreground"
              }`}>
                {workoutLog.status === "completed" ? "Completed" : workoutLog.status === "skipped" ? "Skipped" : "Modified"}
              </span>
            ) : null}
          </div>

          {/* ── Day Summary Strip ── */}
          {(() => {
            const totalDayCalories = day.meals.reduce((s, m) => s + m.totalCalories, 0);
            const totalDayProtein = day.meals.reduce((s, m) => s + m.totalProtein, 0);
            const totalDayCarbs = day.meals.reduce((s, m) => s + m.totalCarbs, 0);
            const totalDayFat = day.meals.reduce((s, m) => s + m.totalFat, 0);
            return (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Calories", value: totalDayCalories, unit: "kcal", icon: Flame },
                  { label: "Protein", value: totalDayProtein, unit: "g", icon: Beef },
                  { label: "Carbs", value: totalDayCarbs, unit: "g", icon: Wheat },
                  { label: "Fat", value: totalDayFat, unit: "g", icon: Droplet },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card border border-border rounded-2xl p-3 text-center shadow-sm">
                    <stat.icon className="w-4 h-4 text-primary mx-auto mb-1" />
                    <p className="text-lg font-black text-card-foreground">{stat.value}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{stat.unit}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* ── Tabs: Meals / Workout ── */}
          {!day.isRestDay && (
            <div className="flex gap-1 bg-secondary p-1 rounded-xl">
              {(["meals", "workout"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
                    activeTab === tab ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "meals" ? <Utensils className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
                  {tab === "meals" ? `Meals (${day.meals.length})` : "Workout"}
                </button>
              ))}
            </div>
          )}

          {/* ── Meals Tab ── */}
          {(activeTab === "meals" || day.isRestDay) && (
            <div className="space-y-3">
              {day.meals.map((meal, i) => (
                <MealCard key={meal.id} meal={meal} index={i} allMeals={day.meals} />
              ))}
            </div>
          )}

          {/* ── Workout Tab ── */}
          {activeTab === "workout" && !day.isRestDay && (
            <div className="space-y-3">
              {day.workout ? (
                <WorkoutCard day={day} />
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BedDouble className="w-10 h-10 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">Rest Day</p>
                  <p className="text-sm mt-1">No workout scheduled. Focus on recovery.</p>
                </div>
              )}
            </div>
          )}

          {/* Rest day content */}
          {day.isRestDay && (
            <div className="bg-secondary border border-border rounded-2xl p-5 text-center">
              <BedDouble className="w-8 h-8 text-secondary-foreground mx-auto" />
              <p className="font-semibold text-foreground mt-2">Active Rest Day</p>
              <p className="text-sm text-muted-foreground mt-1">Light activity only — walk, stretch, recover.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}