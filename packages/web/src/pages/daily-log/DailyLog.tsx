import { useState, useEffect } from "react";
import { useActiveProgram } from "../../hooks/useProgram";
import { useDayPlanDetail } from "../../hooks/useDayPlanDetail";
import { useDayLogs } from "../../hooks/useDayLogs";
import type { ApiMeal, ApiDayPlanDetail } from "../../lib/api-types";
import { apiClient } from "../../lib/api-client";
import { Card, CardContent } from "../../components/ui/card";
import {
  Sunrise, Apple, Salad, Moon, Utensils, Save, ChevronDown,
  Dumbbell, Activity, Flower2, BedDouble, Check, X, Pencil, Circle,
  CheckCircle2, ClipboardList, ArrowRight, type LucideIcon,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_ICONS: Record<string, LucideIcon> = {
  breakfast: Sunrise, snack: Apple, lunch: Salad, dinner: Moon,
};

const WORKOUT_TYPE_ICON: Record<string, LucideIcon> = {
  Strength: Dumbbell, Cardio: Activity, Mobility: Flower2,
};

function getMealLabel(meal: ApiMeal, allMeals: ApiMeal[]): string {
  if (meal.type !== "snack") return meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
  const snackIndex = allMeals.filter((m) => m.type === "snack").indexOf(meal);
  return `Snack ${snackIndex + 1}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type MealLogState = {
  mealId: string;                                               
  status: "pending" | "followed" | "modified" | "skipped";
  note: string;
  actualCalories: string;
};

type WorkoutLogState = {
  status: "pending" | "completed" | "skipped" | "modified";
  note: string;
  completedExerciseIds: Set<string>;                           
};


function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { bg: string; text: string; label: string; icon: LucideIcon }> = {
    followed:  { bg: "bg-primary",     text: "text-primary-foreground",     label: "Followed plan", icon: Check  },
    modified:  { bg: "bg-accent",      text: "text-accent-foreground",      label: "Modified",      icon: Pencil },
    skipped:   { bg: "bg-destructive", text: "text-destructive-foreground", label: "Skipped",       icon: X      },
    completed: { bg: "bg-primary",     text: "text-primary-foreground",     label: "Completed",     icon: Check  },
    pending:   { bg: "bg-muted",       text: "text-muted-foreground",       label: "Not logged",    icon: Circle },
  };
  const c = configs[status] ?? configs.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      <c.icon className="w-3 h-3" /> {c.label}
    </span>
  );
}

function MealLogCard({
  meal, label, log, onChange,
}: {
  meal: ApiMeal;
  label: string;
  log: MealLogState;
  onChange: (mealId: string, updated: MealLogState) => void;
}) {
  const [expanded, setExpanded] = useState(log.status === "pending");
  const Icon = MEAL_ICONS[meal.type] ?? Utensils;

  const setStatus = (status: MealLogState["status"]) => {
    onChange(meal.id, { ...log, status });
    if (status === "followed") setExpanded(false);
    else setExpanded(true);
  };

  const borderColor =
    log.status === "followed" ? "border-primary/30 bg-primary/5"
    : log.status === "modified" ? "border-border bg-accent/40"
    : log.status === "skipped" ? "border-destructive/30 bg-destructive/5"
    : "border-border bg-card";

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${borderColor}`}>
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
          <button onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Plan preview */}
          <div className="bg-card rounded-xl p-3 border border-border space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Planned meals</p>
            {meal.items.map((item) => (
              <div key={item.id} className="flex justify-between text-xs">
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
                  followed: { label: "Followed plan", icon: Check,
                    active: "bg-primary text-primary-foreground border-primary",
                    inactive: "bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-primary" },
                  modified: { label: "Modified it", icon: Pencil,
                    active: "bg-accent text-accent-foreground border-border",
                    inactive: "bg-card text-muted-foreground border-border hover:border-accent-foreground/30 hover:text-accent-foreground" },
                  skipped:  { label: "Skipped", icon: X,
                    active: "bg-destructive text-destructive-foreground border-destructive",
                    inactive: "bg-card text-muted-foreground border-border hover:border-destructive/50 hover:text-destructive" },
                };
                const c = configs[s];
                return (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                      log.status === s ? c.active : c.inactive}`}>
                    <c.icon className="w-3.5 h-3.5" /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note / calories fields */}
          {(log.status === "modified" || log.status === "skipped") && (
            <div className="space-y-2">
              {log.status === "modified" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">Actual calories (optional)</label>
                  <input type="number" placeholder="e.g. 520" value={log.actualCalories}
                    onChange={(e) => onChange(meal.id, { ...log, actualCalories: e.target.value })}
                    className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring bg-card text-card-foreground" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  {log.status === "modified" ? "What did you have instead?" : "Why did you skip?"}
                </label>
                <textarea
                  placeholder={log.status === "modified" ? "e.g. Had a chicken sandwich, roughly 500 kcal" : "e.g. Had a work lunch"}
                  value={log.note}
                  onChange={(e) => onChange(meal.id, { ...log, note: e.target.value })}
                  rows={2}
                  className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring bg-card text-card-foreground resize-none" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WorkoutLogSection({
  day, log, onChange,
}: {
  day: ApiDayPlanDetail;
  log: WorkoutLogState;
  onChange: (updated: WorkoutLogState) => void;
}) {
  const workout = day.workout;
  if (!workout) return null;

  // toggle by exercise ID (not name)
  const toggleExercise = (exerciseId: string) => {
    const next = new Set(log.completedExerciseIds);
    if (next.has(exerciseId)) next.delete(exerciseId);
    else next.add(exerciseId);
    onChange({ ...log, completedExerciseIds: next });
  };

  const completionPct = workout.exercises.length > 0
    ? Math.round((log.completedExerciseIds.size / workout.exercises.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(["completed", "modified", "skipped"] as const).map((s) => {
          const configs = {
            completed: { label: "Completed", icon: Check,
              active: "bg-primary text-primary-foreground shadow-sm",
              inactive: "bg-card text-muted-foreground border border-border hover:border-primary/50" },
            modified:  { label: "Modified",  icon: Pencil,
              active: "bg-accent text-accent-foreground shadow-sm",
              inactive: "bg-card text-muted-foreground border border-border hover:border-accent-foreground/30" },
            skipped:   { label: "Skipped",   icon: X,
              active: "bg-destructive text-destructive-foreground shadow-sm",
              inactive: "bg-card text-muted-foreground border border-border hover:border-destructive/50" },
          };
          const c = configs[s];
          return (
            <button key={s} onClick={() => onChange({ ...log, status: s })}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                log.status === s ? c.active : c.inactive}`}>
              <c.icon className="w-4 h-4" /> {c.label}
            </button>
          );
        })}
      </div>

      {(log.status === "completed" || log.status === "modified") && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="text-sm font-semibold text-card-foreground">Exercise checklist</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{log.completedExerciseIds.size}/{workout.exercises.length}</span>
              <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${completionPct}%` }} />
              </div>
            </div>
          </div>
          <div className="divide-y divide-border">
            {workout.exercises.map((ex) => {
              const done = log.completedExerciseIds.has(ex.id);   // ← use ex.id
              return (
                <button key={ex.id} onClick={() => toggleExercise(ex.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary transition-colors">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    done ? "bg-primary border-primary" : "border-border"}`}>
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

      <div>
        <label className="text-xs font-semibold text-muted-foreground block mb-1.5">
          {log.status === "skipped" ? "Why did you skip?" : "Notes (PRs, how you felt, etc.)"}
        </label>
        <textarea value={log.note} onChange={(e) => onChange({ ...log, note: e.target.value })}
          placeholder={log.status === "skipped" ? "e.g. Felt sick, rescheduling to tomorrow" : "e.g. Hit a new PR on bench press — 85kg × 6"}
          rows={2}
          className="w-full text-sm border border-border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring bg-card text-card-foreground resize-none" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DailyLog() {
  const { program, dayPlans, isLoading: programLoading, error: programError } = useActiveProgram();
  const [viewedDayIndex, setViewedDayIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"meals" | "workout">("meals");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Default to currentDay once program loads
  useEffect(() => {
    if (program) setViewedDayIndex(program.currentDay - 1);
  }, [program]);

  const activeDayPlanSummary = dayPlans[viewedDayIndex];
  const { dayPlan: day, isLoading: dayLoading, error: dayError } = useDayPlanDetail(activeDayPlanSummary?.id ?? null);

  // Load existing logs from DB
  const { mealLogs: existingMealLogs, workoutLog: existingWorkoutLog, completedExerciseIds: existingCompletedIds, error: logsError }
    = useDayLogs(activeDayPlanSummary?.id ?? null);

  // ── Local log state (initialized from DB, edited in-memory until Save) ──
  const [mealLogs, setMealLogs] = useState<Record<string, MealLogState>>({});
  const [workoutLog, setWorkoutLog] = useState<WorkoutLogState>({
    status: "pending", note: "", completedExerciseIds: new Set(),
  });

  // When day or existing logs load, initialize local state
  useEffect(() => {
    if (!day) return;
    const result: Record<string, MealLogState> = {};
    day.meals.forEach((meal) => {
      const existing = existingMealLogs.find((l) => l.mealId === meal.id);
      result[meal.id] = {
        mealId: meal.id,
        status: existing?.status ?? "pending",
        note: existing?.note ?? "",
        actualCalories: existing?.actualCalories?.toString() ?? "",
      };
    });
    setMealLogs(result);
  }, [day, existingMealLogs]);

  useEffect(() => {
    setWorkoutLog({
      status: existingWorkoutLog?.status ?? "pending",
      note: existingWorkoutLog?.note ?? "",
      completedExerciseIds: new Set(existingCompletedIds),
    });
  }, [existingWorkoutLog, existingCompletedIds]);

  const handleMealChange = (mealId: string, updated: MealLogState) => {
    setMealLogs((prev) => ({ ...prev, [mealId]: updated }));
    setSaved(false);
  };

  // ── Batch save ──
  const handleSave = async () => {
    if (!day) return;
    setSaving(true);
    try {
      const mealsPayload = Object.values(mealLogs).map((log) => ({
        mealId: log.mealId,
        status: log.status,
        note: log.note || null,
        actualCalories: log.actualCalories ? Number(log.actualCalories) : null,
      }));

      const workoutPayload = day.workout
        ? {
            workoutId: day.workout.id,
            status: workoutLog.status,
            note: workoutLog.note || null,
            completedExerciseIds: [...workoutLog.completedExerciseIds],
          }
        : null;

      await apiClient.post(`/day-plans/${day.id}/logs`, {
        meals: mealsPayload,
        workout: workoutPayload,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save log", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Summary stats ──
  const logValues = Object.values(mealLogs);
  const totalMeals = logValues.length;
  const followedMeals = logValues.filter((l) => l.status === "followed").length;
  const modifiedMeals = logValues.filter((l) => l.status === "modified").length;
  const skippedMeals  = logValues.filter((l) => l.status === "skipped").length;
  const loggedMeals   = followedMeals + modifiedMeals + skippedMeals;
  const logProgress   = totalMeals > 0 ? Math.round((loggedMeals / totalMeals) * 100) : 0;

  if (programLoading) return <p className="p-6 text-muted-foreground">Loading...</p>;

  if (programError || !program) {
    return (
      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
        {programError ?? "No active program was found. Please choose a plan before logging your day."}
      </div>
    );
  }

  const WorkoutTypeIcon = day?.workout ? WORKOUT_TYPE_ICON[day.workout.type] ?? Dumbbell : Dumbbell;
  const isToday = activeDayPlanSummary?.date === dayPlans[program.currentDay - 1]?.date;

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Daily Log</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            {isToday ? "Today · " : ""}
            {activeDayPlanSummary
              ? new Date(activeDayPlanSummary.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
              : ""}
          </p>
        </div>
        <button onClick={handleSave} disabled={saved || saving}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm ${
            saved ? "bg-primary text-primary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Log"}
        </button>
      </div>

      {/* ── Day Picker Pills ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {dayPlans.map((d, i) => (
          <button key={d.id}
            onClick={() => { setViewedDayIndex(i); setSaved(false); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              i === viewedDayIndex
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-card-foreground border-border hover:border-primary/40"}`}>
            {d.label.slice(0, 3)}
          </button>
        ))}
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
              { label: "Skipped",  value: skippedMeals,  style: "bg-destructive/10 text-destructive" },
              { label: "Pending",  value: totalMeals - loggedMeals, style: "bg-muted text-muted-foreground" },
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
          <span className="text-muted-foreground">
            Week {program.currentWeek} · {activeDayPlanSummary?.isRestDay ? "Rest Day" : day?.workout?.name ?? "Training Day"}
          </span>
        </div>
        <a href="/my-plan" className="ml-auto flex items-center gap-1 text-primary text-xs font-semibold hover:underline whitespace-nowrap">
          View plan <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* ── Loading skeleton ── */}
      {dayError || logsError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 text-sm text-destructive">
          {dayError ?? logsError}
        </div>
      ) : dayLoading || !day ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => <div key={n} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* ── Tabs ── */}
          {!day.isRestDay && (
            <div className="flex gap-1 bg-secondary p-1 rounded-xl">
              {(["meals", "workout"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
                    activeTab === tab ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
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
              {day.meals.map((meal) => (
                <MealLogCard
                  key={meal.id}
                  meal={meal}
                  label={getMealLabel(meal, day.meals)}
                  log={mealLogs[meal.id] ?? { mealId: meal.id, status: "pending", note: "", actualCalories: "" }}
                  onChange={handleMealChange}
                />
              ))}
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
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          workoutLog.status === "completed" ? "bg-primary text-primary-foreground"
                          : workoutLog.status === "modified" ? "bg-accent text-accent-foreground"
                          : "bg-destructive text-destructive-foreground"}`}>
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
            <button onClick={handleSave} disabled={saved || saving}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
                saved ? "bg-primary text-primary-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground"}`}>
              {saved && <CheckCircle2 className="w-4 h-4" />}
              {saving ? "Saving..." : saved ? "Log saved successfully!" : "Save Today's Log"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
