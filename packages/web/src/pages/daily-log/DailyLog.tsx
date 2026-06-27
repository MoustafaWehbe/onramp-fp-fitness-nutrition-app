import { useState } from "react";
import { activeProgram, todayLogs, type DayPlan, type Meal } from "../../mock-data/mockData";
import { Card, CardContent } from "../../components/ui/card";
import {
  Sunrise,
  Apple,
  Salad,
  Moon,
  Utensils,
  Save,
  ChevronDown,
  Dumbbell,
  Activity,
  Flower2,
  BedDouble,
  Check,
  X,
  Pencil,
  Circle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_ICONS: Record<string, LucideIcon> = {
  breakfast: Sunrise,
  snack: Apple,
  lunch: Salad,
  dinner: Moon,
};

const WORKOUT_TYPE_ICON: Record<string, LucideIcon> = {
  Strength: Dumbbell,
  Cardio: Activity,
  Mobility: Flower2,
};

function getMealKey(meal: Meal, index: number, allMeals: Meal[]): string {
  if (meal.type !== "snack") return meal.type;
  const snackIndex = allMeals.filter((m) => m.type === "snack").indexOf(meal);
  return `snack-${snackIndex + 1}`;
}

function getMealLabel(meal: Meal, index: number, allMeals: Meal[]): string {
  if (meal.type !== "snack") return meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
  const snackIndex = allMeals.filter((m) => m.type === "snack").indexOf(meal);
  return `Snack ${snackIndex + 1}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MealLogState = {
  status: "pending" | "followed" | "modified" | "skipped";
  note: string;
  actualCalories: string;
};

type WorkoutLogState = {
  status: "pending" | "completed" | "skipped" | "modified";
  note: string;
  completedExercises: Set<string>;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string; icon: LucideIcon }> = {
    followed: { bg: "bg-primary", text: "text-primary-foreground", label: "Followed plan", icon: Check },
    modified: { bg: "bg-accent", text: "text-accent-foreground", label: "Modified", icon: Pencil },
    skipped: { bg: "bg-destructive", text: "text-destructive-foreground", label: "Skipped", icon: X },
    completed: { bg: "bg-primary", text: "text-primary-foreground", label: "Completed", icon: Check },
    pending: { bg: "bg-muted", text: "text-muted-foreground", label: "Not logged", icon: Circle },
  };
  const c = configs[status] ?? configs.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      <c.icon className="w-3 h-3" /> {c.label}
    </span>
  );
}

function MealLogCard({
  meal,
  mealKey,
  label,
  log,
  onChange,
}: {
  meal: Meal;
  mealKey: string;
  label: string;
  log: MealLogState;
  onChange: (key: string, updated: MealLogState) => void;
}) {
  const [expanded, setExpanded] = useState(log.status === "pending");
  const Icon = MEAL_ICONS[meal.type] ?? Utensils;

  const setStatus = (status: MealLogState["status"]) => {
    onChange(mealKey, { ...log, status });
    if (status !== "pending") setExpanded(false);
  };

  const borderColor =
    log.status === "followed"
      ? "border-primary/30 bg-primary/5"
      : log.status === "modified"
      ? "border-border bg-accent/40"
      : log.status === "skipped"
      ? "border-destructive/30 bg-destructive/5"
      : "border-border bg-card";

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${borderColor}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 shadow-sm">
          <Icon className="w-4 h-4 text-secondary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-card-foreground text-sm">{label}</p>
            <span className="text-xs text-muted-foreground">{meal.time}</span>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {meal.items.slice(0, 3).map((i) => i.name).join(", ")}
            {meal.items.length > 3 && " ..."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={log.status} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Plan preview */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-card rounded-xl p-3 border border-border space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Planned meals</p>
            {meal.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {item.name} <span className="text-muted-foreground/70">— {item.quantity}</span>
                </span>
                <span className="font-semibold text-card-foreground">{item.calories} kcal</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 mt-2 flex justify-between text-xs font-bold">
              <span className="text-card-foreground">Total</span>
              <span className="text-primary">
                {meal.totalCalories} kcal · {meal.totalProtein}g P · {meal.totalCarbs}g C · {meal.totalFat}g F
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">How did it go?</p>
            <div className="grid grid-cols-3 gap-2">
              {(["followed", "modified", "skipped"] as const).map((s) => {
                const configs = {
                  followed: {
                    label: "Followed plan",
                    icon: Check,
                    active: "bg-primary text-primary-foreground border-primary",
                    inactive: "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary",
                  },
                  modified: {
                    label: "Modified it",
                    icon: Pencil,
                    active: "bg-accent text-accent-foreground border-border",
                    inactive: "bg-card text-muted-foreground border-border hover:border-accent-foreground/30 hover:text-accent-foreground",
                  },
                  skipped: {
                    label: "Skipped",
                    icon: X,
                    active: "bg-destructive text-destructive-foreground border-destructive",
                    inactive: "bg-card text-muted-foreground border-border hover:border-destructive/50 hover:text-destructive",
                  },
                };
                const c = configs[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      log.status === s ? c.active : c.inactive
                    }`}
                  >
                    <c.icon className="w-3.5 h-3.5" /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note / calories fields for modified */}
          {(log.status === "modified" || log.status === "skipped") && (
            <div className="space-y-2">
              {log.status === "modified" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Actual calories (optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 520"
                    value={log.actualCalories}
                    onChange={(e) => onChange(mealKey, { ...log, actualCalories: e.target.value })}
                    className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring bg-card text-card-foreground"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {log.status === "modified" ? "What did you have instead?" : "Why did you skip?"}
                </label>
                <textarea
                  placeholder={
                    log.status === "modified"
                      ? "e.g. Had a chicken sandwich, roughly 500 kcal"
                      : "e.g. Had a work lunch, wasn't able to stick to plan"
                  }
                  value={log.note}
                  onChange={(e) => onChange(mealKey, { ...log, note: e.target.value })}
                  rows={2}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring bg-card text-card-foreground resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutLogSection({
  day,
  log,
  onChange,
}: {
  day: DayPlan;
  log: WorkoutLogState;
  onChange: (updated: WorkoutLogState) => void;
}) {
  const workout = day.workout;
  if (!workout) return null;

  const toggleExercise = (name: string) => {
    const next = new Set(log.completedExercises);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    onChange({ ...log, completedExercises: next });
  };

  const completionPct =
    workout.exercises.length > 0 ? Math.round((log.completedExercises.size / workout.exercises.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Status picker */}
      <div className="grid grid-cols-3 gap-2">
        {(["completed", "modified", "skipped"] as const).map((s) => {
          const configs = {
            completed: {
              label: "Completed",
              icon: Check,
              active: "bg-primary text-primary-foreground shadow-sm",
              inactive: "bg-card text-muted-foreground border border-border hover:border-primary/50",
            },
            modified: {
              label: "Modified",
              icon: Pencil,
              active: "bg-accent text-accent-foreground shadow-sm",
              inactive: "bg-card text-muted-foreground border border-border hover:border-accent-foreground/30",
            },
            skipped: {
              label: "Skipped",
              icon: X,
              active: "bg-destructive text-destructive-foreground shadow-sm",
              inactive: "bg-card text-muted-foreground border border-border hover:border-destructive/50",
            },
          };
          const c = configs[s];
          return (
            <button
              key={s}
              onClick={() => onChange({ ...log, status: s })}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                log.status === s ? c.active : c.inactive
              }`}
            >
              <c.icon className="w-4 h-4" /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Exercise checklist — shown when completed or modified */}
      {(log.status === "completed" || log.status === "modified") && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-card-foreground">Exercise checklist</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{log.completedExercises.size}/{workout.exercises.length}</span>
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {workout.exercises.map((ex, i) => {
              const done = log.completedExercises.has(ex.name);
              return (
                <button
                  key={i}
                  onClick={() => toggleExercise(ex.name)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors"
                >
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                      done ? "bg-primary border-primary" : "border-border"
                    }`}
                  >
                    {done && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${done ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
                      {ex.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{ex.sets} sets × {ex.reps} · Rest {ex.rest}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{ex.muscle}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
          {log.status === "skipped" ? "Why did you skip?" : "Notes (PRs, how you felt, etc.)"}
        </label>
        <textarea
          value={log.note}
          onChange={(e) => onChange({ ...log, note: e.target.value })}
          placeholder={
            log.status === "skipped" ? "e.g. Felt sick, rescheduling to tomorrow" : "e.g. Hit a new PR on bench press — 85kg × 6"
          }
          rows={2}
          className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring bg-card text-card-foreground resize-none"
        />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DailyLog() {
  const program = activeProgram;
  const todayIndex = program.currentDay - 1;
  const [viewedDayIndex, setViewedDayIndex] = useState(todayIndex);
  const day = program.weekPlan[viewedDayIndex];

  // Initialize meal logs from mock data (or fresh)
  const initMealLogs = (): Record<string, MealLogState> => {
    const existing = todayLogs[day.date]?.meals ?? {};
    const result: Record<string, MealLogState> = {};
    day.meals.forEach((meal, i) => {
      const key = getMealKey(meal, i, day.meals);
      const prev = existing[key];
      result[key] = {
        status: prev ? (prev.followed ? "followed" : "modified") : "pending",
        note: prev?.note ?? "",
        actualCalories: prev?.actualCalories?.toString() ?? "",
      };
    });
    return result;
  };

  const initWorkoutLog = (): WorkoutLogState => {
    const existing = todayLogs[day.date]?.workout;
    if (!existing) return { status: "pending", note: "", completedExercises: new Set() };
    return {
      status: existing.status,
      note: existing.note,
      completedExercises: new Set(existing.completedExercises ?? []),
    };
  };

  const [mealLogs, setMealLogs] = useState<Record<string, MealLogState>>(initMealLogs);
  const [workoutLog, setWorkoutLog] = useState<WorkoutLogState>(initWorkoutLog);
  const [activeTab, setActiveTab] = useState<"meals" | "workout">("meals");
  const [saved, setSaved] = useState(false);

  const handleMealChange = (key: string, updated: MealLogState) => {
    setMealLogs((prev) => ({ ...prev, [key]: updated }));
    setSaved(false);
  };

  const handleSave = () => {
    // In production: persist to API/store
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Summary stats
  const totalMeals = Object.keys(mealLogs).length;
  const followedMeals = Object.values(mealLogs).filter((l) => l.status === "followed").length;
  const modifiedMeals = Object.values(mealLogs).filter((l) => l.status === "modified").length;
  const skippedMeals = Object.values(mealLogs).filter((l) => l.status === "skipped").length;
  const loggedMeals = followedMeals + modifiedMeals + skippedMeals;
  const logProgress = totalMeals > 0 ? Math.round((loggedMeals / totalMeals) * 100) : 0;

  const isToday = day.date === program.weekPlan[todayIndex].date;
  const WorkoutTypeIcon = day.workout ? WORKOUT_TYPE_ICON[day.workout.type] ?? Dumbbell : Dumbbell;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Log</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {isToday ? "Today · " : ""}
            {new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saved}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm ${
            saved ? "bg-primary text-primary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Log"}
        </button>
      </div>

      {/* ── Day Picker Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {program.weekPlan.map((d, i) => {
          const isCurrentView = i === viewedDayIndex;
          const hasLog = !!todayLogs[d.date];
          return (
            <button
              key={d.day}
              onClick={() => {
                setViewedDayIndex(i);
                setSaved(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                isCurrentView
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-card-foreground border-border hover:border-primary/40"
              }`}
            >
              {d.label.slice(0, 3)}
              {hasLog && !isCurrentView && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>

      {/* ── Progress Summary ── */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-card-foreground">Today's log progress</p>
            <span className="text-sm font-bold text-primary">{loggedMeals}/{totalMeals} logged</span>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-3">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${logProgress}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Followed", value: followedMeals, style: "bg-primary/10 text-primary" },
              { label: "Modified", value: modifiedMeals, style: "bg-accent text-accent-foreground" },
              { label: "Skipped", value: skippedMeals, style: "bg-destructive/10 text-destructive" },
              { label: "Pending", value: totalMeals - loggedMeals, style: "bg-muted text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-2.5 text-center ${s.style.split(" ")[0]}`}>
                <p className={`text-xl font-black ${s.style.split(" ")[1]}`}>{s.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Program context bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-secondary border border-border rounded-xl text-sm">
        <ClipboardList className="w-4 h-4 text-secondary-foreground flex-shrink-0" />
        <div>
          <span className="font-semibold text-secondary-foreground">{program.title}</span>
          <span className="text-muted-foreground mx-2">·</span>
          <span className="text-muted-foreground">Week {program.currentWeek} · {day.isRestDay ? "Rest Day" : day.workout?.name ?? "Training Day"}</span>
        </div>
        <a href="/my-plan" className="ml-auto flex items-center gap-1 text-primary text-xs font-semibold hover:underline whitespace-nowrap">
          View plan <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* ── Tabs ── */}
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
              {tab === "meals" ? "Meals" : "Workout"}
            </button>
          ))}
        </div>
      )}

      {/* ── Meals Log ── */}
      {(activeTab === "meals" || day.isRestDay) && (
        <div className="space-y-3">
          {day.isRestDay && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Meals · Rest Day</p>}
          {day.meals.map((meal, i) => {
            const key = getMealKey(meal, i, day.meals);
            const label = getMealLabel(meal, i, day.meals);
            return (
              <MealLogCard
                key={key}
                meal={meal}
                mealKey={key}
                label={label}
                log={mealLogs[key] ?? { status: "pending", note: "", actualCalories: "" }}
                onChange={handleMealChange}
              />
            );
          })}
        </div>
      )}

      {/* ── Workout Log ── */}
      {activeTab === "workout" && !day.isRestDay && (
        <div className="space-y-4">
          {day.workout ? (
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <WorkoutTypeIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-card-foreground">{day.workout.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {day.workout.exercises.length} exercises · {day.workout.duration} · {day.workout.type}
                  </p>
                </div>
                {workoutLog.status !== "pending" && (
                  <div className="ml-auto">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        workoutLog.status === "completed"
                          ? "bg-primary text-primary-foreground"
                          : workoutLog.status === "modified"
                          ? "bg-accent text-accent-foreground"
                          : "bg-destructive text-destructive-foreground"
                      }`}
                    >
                      {workoutLog.status === "completed" ? "Completed" : workoutLog.status === "modified" ? "Modified" : "Skipped"}
                    </span>
                  </div>
                )}
              </div>
              <WorkoutLogSection day={day} log={workoutLog} onChange={setWorkoutLog} />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BedDouble className="w-10 h-10 mx-auto" />
              <p className="font-semibold text-foreground mt-3">Rest Day — No workout scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* ── Rest day note ── */}
      {day.isRestDay && (
        <div className="bg-secondary border border-border rounded-2xl p-4 text-center">
          <BedDouble className="w-6 h-6 text-secondary-foreground mx-auto" />
          <p className="font-semibold text-foreground mt-2">Rest Day</p>
          <p className="text-sm text-muted-foreground mt-1">No workout to log. Focus on nutrition and recovery.</p>
        </div>
      )}

      {/* ── Save button (bottom) ── */}
      <div className="pb-6">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
            saved ? "bg-primary text-primary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
          {saved ? "Log saved successfully!" : "Save Today's Log"}
        </button>
      </div>
    </div>
  );
}