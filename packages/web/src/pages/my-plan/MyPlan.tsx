import { useState } from "react";
import {
  Sunrise,
  Apple,
  Salad,
  Moon,
  Utensils,
  UtensilsCrossed,
  Dumbbell,
  Activity,
  Flower2,
  BedDouble,
  ChevronDown,
  Check,
  X,
  Pencil,
  CheckCircle2,
  BarChart3,
  NotebookPen,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { activeProgram, todayLogs, type DayPlan, type Meal } from "../../mock-data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MEAL_STYLES: Record<string, { icon: LucideIcon; bg: string; text: string }> = {
  breakfast: { icon: Sunrise, bg: "bg-amber-50", text: "text-amber-600" },
  snack: { icon: Apple, bg: "bg-emerald-50", text: "text-emerald-600" },
  lunch: { icon: Salad, bg: "bg-teal-50", text: "text-teal-600" },
  dinner: { icon: Moon, bg: "bg-indigo-50", text: "text-indigo-600" },
};
const DEFAULT_MEAL_STYLE = { icon: Utensils, bg: "bg-slate-50", text: "text-slate-500" };

const MUSCLE_COLORS: Record<string, string> = {
  "Chest": "bg-rose-100 text-rose-700",
  "Back": "bg-blue-100 text-blue-700",
  "Back / Biceps": "bg-blue-100 text-blue-700",
  "Shoulders": "bg-purple-100 text-purple-700",
  "Rear Delts": "bg-purple-100 text-purple-700",
  "Legs": "bg-emerald-100 text-emerald-700",
  "Quads": "bg-emerald-100 text-emerald-700",
  "Quads / Glutes": "bg-emerald-100 text-emerald-700",
  "Hamstrings": "bg-teal-100 text-teal-700",
  "Calves": "bg-teal-100 text-teal-700",
  "Triceps": "bg-orange-100 text-orange-700",
  "Biceps": "bg-amber-100 text-amber-700",
  "Core": "bg-yellow-100 text-yellow-700",
  "Full Body": "bg-slate-100 text-slate-700",
  "Legs / Cardio": "bg-emerald-100 text-emerald-700",
  "Hips": "bg-pink-100 text-pink-700",
  "Spine": "bg-indigo-100 text-indigo-700",
  "Cardio": "bg-cyan-100 text-cyan-700",
};

const WORKOUT_TYPE_STYLE: Record<string, { bg: string; text: string; border: string; icon: LucideIcon }> = {
  "Strength": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", icon: Dumbbell },
  "Cardio": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", icon: Activity },
  "Mobility": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: Flower2 },
};

function getMealSnackLabel(meal: Meal, index: number, allMeals: Meal[]): string {
  if (meal.type !== "snack") return meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
  const snackIndex = allMeals
    .filter((m) => m.type === "snack")
    .indexOf(meal);
  return `Snack ${snackIndex + 1}`;
}

function getDayLogStatus(dayPlan: DayPlan) {
  const log = todayLogs[dayPlan.date];
  if (!log) return { meals: 0, total: 0, workoutStatus: null };
  const mealKeys = Object.keys(log.meals);
  const followed = mealKeys.filter((k) => log.meals[k].followed).length;
  return {
    meals: followed,
    total: mealKeys.length,
    workoutStatus: log.workout?.status ?? null,
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressRing({ value, size = 56, stroke = 4, color = "#6366f1" }: {
  value: number; size?: number; stroke?: number; color?: string;
}) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    </svg>
  );
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500 font-medium">{label}</span>
        <span className="text-slate-700 font-semibold">{value}g</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function DayNavButton({
  day, selected, onClick,
}: { day: DayPlan; selected: boolean; onClick: () => void }) {
  const logStatus = getDayLogStatus(day);
  const isToday = day.date === new Date().toISOString().slice(0, 10);

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
        selected
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
      }`}
    >
      <span className={`text-[10px] font-semibold uppercase tracking-wider ${selected ? "text-indigo-200" : "text-slate-400"}`}>
        {day.label.slice(0, 3)}
      </span>
      <span className={`text-sm font-bold ${selected ? "text-white" : "text-slate-700"}`}>
        {parseInt(day.date.split("-")[2])}
      </span>
      {day.isRestDay ? (
        <span className={`text-[9px] font-medium ${selected ? "text-indigo-200" : "text-slate-400"}`}>Rest</span>
      ) : logStatus.workoutStatus === "completed" ? (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
      ) : logStatus.workoutStatus === "skipped" ? (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${selected ? "bg-indigo-300" : "bg-slate-200"}`} />
      )}
      {isToday && (
        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
      )}
    </button>
  );
}

function MealCard({ meal, index, allMeals }: { meal: Meal; index: number; allMeals: Meal[] }) {
  const [expanded, setExpanded] = useState(false);
  const label = getMealSnackLabel(meal, index, allMeals);
  const mealStyle = MEAL_STYLES[meal.type] ?? DEFAULT_MEAL_STYLE;
  const MealIcon = mealStyle.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${mealStyle.bg}`}>
          <MealIcon className={`w-5 h-5 ${mealStyle.text}`} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-slate-800 text-sm">{label}</p>
            <span className="text-xs text-slate-400">{meal.time}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {meal.items.map((i) => i.name).join(" · ")}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-slate-800">{meal.totalCalories}</p>
          <p className="text-[10px] text-slate-400">kcal</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 ml-1 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-50 px-4 pb-4 pt-3 space-y-4">
          {/* Items */}
          <div className="space-y-2">
            {meal.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-400 ml-2 text-xs">{item.quantity}</span>
                </div>
                <span className="text-slate-600 font-semibold">{item.calories} kcal</span>
              </div>
            ))}
          </div>
          {/* Macros */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50">
            <MacroBar label="Protein" value={meal.totalProtein} max={60} color="bg-indigo-400" />
            <MacroBar label="Carbs" value={meal.totalCarbs} max={80} color="bg-amber-400" />
            <MacroBar label="Fat" value={meal.totalFat} max={40} color="bg-rose-400" />
          </div>
        </div>
      )}
    </div>
  );
}

function WorkoutCard({ day }: { day: DayPlan }) {
  const [expanded, setExpanded] = useState(false);
  if (!day.workout) return null;
  const { workout } = day;
  const style = WORKOUT_TYPE_STYLE[workout.type] ?? WORKOUT_TYPE_STYLE["Strength"];
  const TypeIcon = style.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}>
            <TypeIcon className={`w-5 h-5 ${style.text}`} strokeWidth={2} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-slate-800 text-sm">{workout.name}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
                {workout.type}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {workout.exercises.length} exercises · {workout.duration}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-50 px-4 pb-4 pt-3">
          <div className="space-y-2">
            {workout.exercises.map((ex, i) => (
              <div key={i} className="flex items-start justify-between gap-2 text-sm py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-800">{ex.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-slate-500">{ex.sets} sets × {ex.reps}</span>
                      <span className="text-xs text-slate-400">Rest {ex.rest}</span>
                      {ex.notes && <span className="text-xs text-amber-600 italic">{ex.notes}</span>}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0 ${MUSCLE_COLORS[ex.muscle] ?? "bg-slate-100 text-slate-600"}`}>
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
  const [activeDay, setActiveDay] = useState(activeProgram.currentDay - 1);
  const [activeTab, setActiveTab] = useState<"meals" | "workout">("meals");

  const program = activeProgram;
  const day = program.weekPlan[activeDay];
  const progressPct = Math.round((program.completedDays / program.totalDays) * 100);

  const totalDayCalories = day.meals.reduce((s, m) => s + m.totalCalories, 0);
  const totalDayProtein = day.meals.reduce((s, m) => s + m.totalProtein, 0);
  const totalDayCarbs = day.meals.reduce((s, m) => s + m.totalCarbs, 0);
  const totalDayFat = day.meals.reduce((s, m) => s + m.totalFat, 0);

  const logStatus = getDayLogStatus(day);
  const mealAdherence = logStatus.total > 0 ? Math.round((logStatus.meals / logStatus.total) * 100) : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Plan</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Week {program.currentWeek} of {program.weeks}</p>
        </div>
        <a
          href="/daily-log"
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shadow-indigo-200"
        >
          <NotebookPen className="w-4 h-4" /> Log Today
        </a>
      </div>

      {/* ── Program Card ── */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-700 text-white overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">{program.goal}</span>
                <span className="text-xs text-indigo-200">{program.level}</span>
              </div>
              <h2 className="text-lg font-bold leading-tight">{program.title}</h2>
              <p className="text-indigo-200 text-sm mt-0.5">{program.duration} · {program.calories} kcal/day target</p>
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-indigo-200">
                  <span>Overall progress</span>
                  <span className="font-semibold text-white">{progressPct}% · Day {program.completedDays}/{program.totalDays}</span>
                </div>
                <div className="h-2 rounded-full bg-white/20 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-700"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="relative flex-shrink-0">
              <ProgressRing value={program.adherenceRate} size={72} stroke={5} color="white" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-black leading-none">{program.adherenceRate}%</span>
                <span className="text-[9px] text-indigo-200 mt-0.5">adherence</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Day Selector ── */}
      <div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {program.weekPlan.map((d, i) => (
            <DayNavButton
              key={d.day}
              day={d}
              selected={i === activeDay}
              onClick={() => setActiveDay(i)}
            />
          ))}
        </div>
      </div>

      {/* ── Selected Day Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{day.label}</h3>
          <p className="text-sm text-slate-500">
            {new Date(day.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>
        {day.isRestDay ? (
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-sm font-semibold px-3 py-1.5 rounded-xl">
            <BedDouble className="w-4 h-4" /> Rest Day
          </span>
        ) : logStatus.workoutStatus ? (
          <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-xl ${
            logStatus.workoutStatus === "completed"
              ? "bg-emerald-100 text-emerald-700"
              : logStatus.workoutStatus === "skipped"
              ? "bg-rose-100 text-rose-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {logStatus.workoutStatus === "completed" ? <Check className="w-4 h-4" /> : logStatus.workoutStatus === "skipped" ? <X className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            {logStatus.workoutStatus === "completed" ? "Completed" : logStatus.workoutStatus === "skipped" ? "Skipped" : "Modified"}
          </span>
        ) : null}
      </div>

      {/* ── Day Summary Strip ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Calories", value: totalDayCalories, unit: "kcal", color: "text-indigo-600" },
          { label: "Protein", value: totalDayProtein, unit: "g", color: "text-blue-600" },
          { label: "Carbs", value: totalDayCarbs, unit: "g", color: "text-amber-600" },
          { label: "Fat", value: totalDayFat, unit: "g", color: "text-rose-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-100 rounded-2xl p-3 text-center shadow-sm">
            <p className={`text-lg font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{stat.unit}</p>
            <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Logging Status Banner ── */}
      {logStatus.total > 0 && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm ${
          mealAdherence === 100 ? "bg-emerald-50 border border-emerald-200" : "bg-amber-50 border border-amber-200"
        }`}>
          <div className="flex items-center gap-2">
            {mealAdherence === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <BarChart3 className="w-4 h-4 text-amber-600" />
            )}
            <span className={`font-semibold ${mealAdherence === 100 ? "text-emerald-700" : "text-amber-700"}`}>
              {logStatus.meals}/{logStatus.total} meals logged · {mealAdherence}% adherence
            </span>
          </div>
          <a href="/daily-log" className={`inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2 ${mealAdherence === 100 ? "text-emerald-600" : "text-amber-600"}`}>
            Update log <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* ── Tabs: Meals / Workout ── */}
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
              {tab === "meals" ? `Meals (${day.meals.length})` : "Workout"}
            </button>
          ))}
        </div>
      )}

      {/* ── Meals Tab ── */}
      {activeTab === "meals" && !day.isRestDay && (
         <div className="space-y-3">
           {day.meals.map((meal, i) => (
             <MealCard key={i} meal={meal} index={i} allMeals={day.meals} />
           ))}
         </div>
       )}

      {/* ── Workout Tab ── */}
      {activeTab === "workout" && !day.isRestDay && (
        <div className="space-y-3">
          {day.workout ? (
            <WorkoutCard day={day} />
          ) : (
            <div className="text-center py-12 text-slate-400">
              <BedDouble className="w-10 h-10 mx-auto mb-3" strokeWidth={1.5} />
              <p className="font-semibold text-slate-600">Rest Day</p>
              <p className="text-sm mt-1">No workout scheduled. Focus on recovery.</p>
            </div>
          )}
        </div>
      )}

      {/* Rest day content */}
      {day.isRestDay && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-700">Meals</p>
          {day.meals.map((meal, i) => (
            <MealCard key={i} meal={meal} index={i} allMeals={day.meals} />
          ))}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center">
            <BedDouble className="w-8 h-8 mx-auto text-slate-400" strokeWidth={1.5} />
            <p className="font-semibold text-slate-700 mt-2">Active Rest Day</p>
            <p className="text-sm text-slate-500 mt-1">Light activity only — walk, stretch, recover. Let your muscles rebuild.</p>
          </div>
        </div>
      )}
    </div>
  );
}