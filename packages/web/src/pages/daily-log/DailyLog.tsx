import { useState } from "react";
import {
  Sunrise,
  Apple,
  Salad,
  Moon,
  Utensils,
  UtensilsCrossed,
  Dumbbell,
  BedDouble,
  ClipboardList,
  ChevronDown,
  Check,
  Pencil,
  X,
  Circle,
  Save,
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { activeProgram, todayLogs, type DayPlan, type Meal, type MealLog, type WorkoutLog } from "../../mock-data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_STYLES: Record<string, { icon: LucideIcon; bg: string; text: string }> = {
  breakfast: { icon: Sunrise, bg: "bg-amber-50", text: "text-amber-600" },
  snack: { icon: Apple, bg: "bg-emerald-50", text: "text-emerald-600" },
  lunch: { icon: Salad, bg: "bg-teal-50", text: "text-teal-600" },
  dinner: { icon: Moon, bg: "bg-indigo-50", text: "text-indigo-600" },
};
const DEFAULT_MEAL_STYLE = { icon: Utensils, bg: "bg-slate-50", text: "text-slate-500" };

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
  const configs: Record<string, { bg: string; text: string; label: string; Icon: LucideIcon }> = {
    followed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Followed plan", Icon: Check },
    modified: { bg: "bg-amber-100", text: "text-amber-700", label: "Modified", Icon: Pencil },
    skipped: { bg: "bg-rose-100", text: "text-rose-700", label: "Skipped", Icon: X },
    completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed", Icon: Check },
    pending: { bg: "bg-slate-100", text: "text-slate-500", label: "Not logged", Icon: Circle },
  };
  const c = configs[status] ?? configs.pending;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
      <c.Icon className="w-3 h-3" strokeWidth={2.5} /> {c.label}
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
  const mealStyle = MEAL_STYLES[meal.type] ?? DEFAULT_MEAL_STYLE;
  const MealIcon = mealStyle.icon;

  const setStatus = (status: MealLogState["status"]) => {
    onChange(mealKey, { ...log, status });
    if (status !== "pending") setExpanded(false);
  };

  const borderColor =
    log.status === "followed" ? "border-emerald-200 bg-emerald-50/30"
    : log.status === "modified" ? "border-amber-200 bg-amber-50/30"
    : log.status === "skipped" ? "border-rose-200 bg-rose-50/30"
    : "border-slate-200 bg-white";

  return (
    <div className={`rounded-2xl border transition-all duration-300 overflow-hidden ${borderColor}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${mealStyle.bg}`}>
          <MealIcon className={`w-[18px] h-[18px] ${mealStyle.text}`} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm">{label}</p>
            <span className="text-xs text-slate-400">{meal.time}</span>
          </div>
          <p className="text-xs text-slate-500 truncate">
            {meal.items.slice(0, 3).map((i) => i.name).join(", ")}
            {meal.items.length > 3 && " ..."}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={log.status} />
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Plan preview */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="bg-white rounded-xl p-3 border border-slate-100 space-y-1.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Planned meals</p>
            {meal.items.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-600">{item.name} <span className="text-slate-400">— {item.quantity}</span></span>
                <span className="font-semibold text-slate-700">{item.calories} kcal</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 mt-2 flex justify-between text-xs font-bold">
              <span className="text-slate-700">Total</span>
              <span className="text-indigo-600">{meal.totalCalories} kcal · {meal.totalProtein}g P · {meal.totalCarbs}g C · {meal.totalFat}g F</span>
            </div>
          </div>

          {/* Action buttons */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">How did it go?</p>
            <div className="grid grid-cols-3 gap-2">
              {(["followed", "modified", "skipped"] as const).map((s) => {
                const configs = {
                  followed: { label: "Followed plan", Icon: Check, active: "bg-emerald-600 text-white", inactive: "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700" },
                  modified: { label: "Modified it", Icon: Pencil, active: "bg-amber-500 text-white", inactive: "bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700" },
                  skipped: { label: "Skipped", Icon: X, active: "bg-rose-600 text-white", inactive: "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-700" },
                };
                const c = configs[s];
                return (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${log.status === s ? c.active : c.inactive}`}
                  >
                    <c.Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {c.label}
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
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Actual calories (optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 520"
                    value={log.actualCalories}
                    onChange={(e) => onChange(mealKey, { ...log, actualCalories: e.target.value })}
                    className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {log.status === "modified" ? "What did you have instead?" : "Why did you skip?"}
                </label>
                <textarea
                  placeholder={log.status === "modified" ? "e.g. Had a chicken sandwich, roughly 500 kcal" : "e.g. Had a work lunch, wasn't able to stick to plan"}
                  value={log.note}
                  onChange={(e) => onChange(mealKey, { ...log, note: e.target.value })}
                  rows={2}
                  className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white resize-none"
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

  const completionPct = workout.exercises.length > 0
    ? Math.round((log.completedExercises.size / workout.exercises.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Status picker */}
      <div className="grid grid-cols-3 gap-2">
        {(["completed", "modified", "skipped"] as const).map((s) => {
          const configs = {
            completed: { label: "Completed", Icon: Check, active: "bg-emerald-600 text-white shadow-sm shadow-emerald-200", inactive: "bg-white text-slate-600 border border-slate-200 hover:border-emerald-300" },
            modified: { label: "Modified", Icon: Pencil, active: "bg-amber-500 text-white shadow-sm shadow-amber-200", inactive: "bg-white text-slate-600 border border-slate-200 hover:border-amber-300" },
            skipped: { label: "Skipped", Icon: X, active: "bg-rose-600 text-white shadow-sm shadow-rose-200", inactive: "bg-white text-slate-600 border border-slate-200 hover:border-rose-300" },
          };
          const c = configs[s];
          return (
            <button
              key={s}
              onClick={() => onChange({ ...log, status: s })}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${log.status === s ? c.active : c.inactive}`}
            >
              <c.Icon className="w-4 h-4" strokeWidth={2.5} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Exercise checklist — shown when completed or modified */}
      {(log.status === "completed" || log.status === "modified") && (
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-50 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Exercise checklist</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{log.completedExercises.size}/{workout.exercises.length}</span>
              <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="divide-y divide-slate-50">
            {workout.exercises.map((ex, i) => {
              const done = log.completedExercises.has(ex.name);
              return (
                <button
                  key={i}
                  onClick={() => toggleExercise(ex.name)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                    done ? "bg-indigo-600 border-indigo-600" : "border-slate-300"
                  }`}>
                    {done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium transition-colors ${done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                      {ex.name}
                    </p>
                    <p className="text-xs text-slate-400">{ex.sets} sets × {ex.reps} · Rest {ex.rest}</p>
                  </div>
                  <span className="text-xs text-slate-400">{ex.muscle}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="text-xs font-semibold text-slate-500 block mb-1.5">
          {log.status === "skipped" ? "Why did you skip?" : "Notes (PRs, how you felt, etc.)"}
        </label>
        <textarea
          value={log.note}
          onChange={(e) => onChange({ ...log, note: e.target.value })}
          placeholder={
            log.status === "skipped"
              ? "e.g. Felt sick, rescheduling to tomorrow"
              : "e.g. Hit a new PR on bench press — 85kg × 6"
          }
          rows={2}
          className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white resize-none"
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

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Daily Log</h1>
          <p className="text-slate-500 mt-0.5 text-sm">
            {isToday ? "Today · " : ""}
            {new Date(day.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saved}
          className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm ${
            saved
              ? "bg-emerald-600 text-white shadow-emerald-200"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved" : "Save Log"}
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isCurrentView
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-200"
              }`}
            >
              {d.label.slice(0, 3)}
              {hasLog && !isCurrentView && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Progress Summary ── */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-700">Today's log progress</p>
            <span className="text-sm font-bold text-indigo-600">{loggedMeals}/{totalMeals} logged</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500"
              style={{ width: `${logProgress}%` }}
            />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Followed", value: followedMeals, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Modified", value: modifiedMeals, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Skipped", value: skippedMeals, color: "text-rose-600", bg: "bg-rose-50" },
              { label: "Pending", value: totalMeals - loggedMeals, color: "text-slate-500", bg: "bg-slate-50" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-2.5 text-center ${s.bg}`}>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Program context bar ── */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
        <ClipboardList className="w-[18px] h-[18px] text-slate-500 flex-shrink-0" strokeWidth={2} />
        <div>
          <span className="font-semibold text-slate-700">{program.title}</span>
          <span className="text-slate-400 mx-2">·</span>
          <span className="text-slate-500">Week {program.currentWeek} · {day.isRestDay ? "Rest Day" : day.workout?.name ?? "Training Day"}</span>
        </div>
        <a href="/my-plan" className="ml-auto inline-flex items-center gap-1 text-indigo-600 text-xs font-semibold hover:underline whitespace-nowrap">
          View plan <ArrowRight className="w-3 h-3" />
        </a>
      </div>

      {/* ── Tabs ── */}
      {!day.isRestDay && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(["meals", "workout"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 capitalize ${
                activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "meals" ? <UtensilsCrossed className="w-4 h-4" /> : <Dumbbell className="w-4 h-4" />}
              {tab === "meals" ? "Meals" : "Workout"}
            </button>
          ))}
        </div>
      )}

      {/* ── Meals Log ── */}
      {(activeTab === "meals" || day.isRestDay) && (
        <div className="space-y-3">
          {day.isRestDay && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meals · Rest Day</p>
          )}
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
            <>
              <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Dumbbell className="w-5 h-5 text-indigo-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{day.workout.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {day.workout.exercises.length} exercises · {day.workout.duration} · {day.workout.type}
                    </p>
                  </div>
                  {workoutLog.status !== "pending" && (
                    <div className="ml-auto">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                        workoutLog.status === "completed" ? "bg-emerald-100 text-emerald-700" :
                        workoutLog.status === "modified" ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      }`}>
                        {workoutLog.status === "completed" ? <Check className="w-3 h-3" strokeWidth={2.5} /> :
                         workoutLog.status === "modified" ? <Pencil className="w-3 h-3" strokeWidth={2.5} /> :
                         <X className="w-3 h-3" strokeWidth={2.5} />}
                        {workoutLog.status === "completed" ? "Completed" :
                         workoutLog.status === "modified" ? "Modified" : "Skipped"}
                      </span>
                    </div>
                  )}
                </div>
                <WorkoutLogSection day={day} log={workoutLog} onChange={setWorkoutLog} />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <BedDouble className="w-10 h-10 mx-auto" strokeWidth={1.5} />
              <p className="font-semibold text-slate-600 mt-3">Rest Day — No workout scheduled</p>
            </div>
          )}
        </div>
      )}

      {/* ── Rest day note ── */}
      {day.isRestDay && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <BedDouble className="w-7 h-7 mx-auto text-slate-400" strokeWidth={1.5} />
          <p className="font-semibold text-slate-700 mt-2">Rest Day</p>
          <p className="text-sm text-slate-500 mt-1">No workout to log. Focus on nutrition and recovery.</p>
        </div>
      )}

      {/* ── Save button (bottom) ── */}
      <div className="pb-6">
        <button
          onClick={handleSave}
          disabled={saved}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
            saved
              ? "bg-emerald-600 text-white shadow-emerald-200"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200"
          }`}
        >
          {saved ? <CheckCircle2 className="w-4 h-4" /> : null}
          {saved ? "Log saved successfully!" : "Save Today's Log"}
        </button>
      </div>
    </div>
  );
}