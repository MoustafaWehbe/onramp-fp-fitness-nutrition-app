import { useMemo, useState } from "react";
import {
  Activity,
  ClipboardCheck,
  Dumbbell,
  Flame,
  Target,
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
  macroBreakdown,
  saveMeasurements,
  weeklyNutrition,
  weeklyWorkoutCompletion,
  type MacroBreakdown,
  type MeasurementEntry,
  type WeeklyNutrition,
  type WeeklyWorkoutCompletion,
} from "../../lib/fitness-mock-data";

const chartHeight = 220;
const chartWidth = 620;
const chartPadding = 34;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getCurrentStreak(logs: ReturnType<typeof getDailyLogs>): number {
  let streak = 0;

  for (let index = logs.length - 1; index >= 0; index -= 1) {
    if (!logs[index].workoutCompleted) break;
    streak += 1;
  }

  return streak;
}

function LineChart({ data }: { data: WeeklyNutrition[] }) {
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
      className="h-64 w-full"
      role="img"
      aria-label="Weekly calorie intake compared with target"
    >
      <line
        x1={chartPadding}
        y1={chartHeight - chartPadding}
        x2={chartWidth - chartPadding}
        y2={chartHeight - chartPadding}
        className="stroke-border"
      />
      <polyline
        points={targetPoints}
        fill="none"
        className="stroke-muted-foreground"
        strokeDasharray="6 6"
        strokeWidth="3"
      />
      <polyline
        points={intakePoints}
        fill="none"
        className="stroke-primary"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      {data.map((item, index) => (
        <g key={item.week}>
          <circle cx={x(index)} cy={y(item.calories)} r="5" className="fill-primary" />
          <text
            x={x(index)}
            y={chartHeight - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[12px]"
          >
            {item.week}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ data }: { data: WeeklyWorkoutCompletion[] }) {
  return (
    <div className="flex h-64 items-end gap-4">
      {data.map((item) => {
        const rate = Math.round((item.completed / item.target) * 100);

        return (
          <div key={item.week} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end rounded-md bg-muted">
              <div
                className="w-full rounded-md bg-primary transition-all"
                style={{ height: `${clamp(rate, 8, 100)}%` }}
                aria-label={`${item.week} workout completion ${rate}%`}
              />
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{rate}%</div>
              <div className="text-xs text-muted-foreground">{item.week}</div>
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

  return (
    <div className="grid gap-6 sm:grid-cols-[180px_1fr] sm:items-center">
      <svg viewBox="0 0 120 120" className="mx-auto h-44 w-44" role="img">
        <circle cx="60" cy="60" r="44" fill="none" className="stroke-muted" strokeWidth="18" />
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
        <text x="60" y="72" textAnchor="middle" className="fill-muted-foreground text-[10px]">
          logged
        </text>
      </svg>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span>{item.label}</span>
            </div>
            <span className="font-medium">{item.grams}g</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MeasurementTrend({ data }: { data: MeasurementEntry[] }) {
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
      className="h-64 w-full"
      role="img"
      aria-label="Body measurement trends"
    >
      <line
        x1={chartPadding}
        y1={chartHeight - chartPadding}
        x2={chartWidth - chartPadding}
        y2={chartHeight - chartPadding}
        className="stroke-border"
      />
      <polyline
        points={weightPoints}
        fill="none"
        stroke="#2563eb"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <polyline
        points={waistPoints}
        fill="none"
        stroke="#16a34a"
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
          className="fill-muted-foreground text-[12px]"
        >
          {item.date}
        </text>
      ))}
    </svg>
  );
}

export function Progress() {
  const plan = getActivePlan();
  const logs = getDailyLogs();
  const [measurements, setMeasurements] = useState(() => getMeasurements());
  const latestMeasurement = measurements[measurements.length - 1];
  const [form, setForm] = useState({
    weight: latestMeasurement.weight.toString(),
    waist: latestMeasurement.waist.toString(),
    chest: latestMeasurement.chest.toString(),
    hips: latestMeasurement.hips.toString(),
  });

  const stats = useMemo(() => {
    const workoutsCompleted = weeklyWorkoutCompletion.reduce(
      (sum, item) => sum + item.completed,
      0,
    );
    const averageCalories =
      logs.reduce((sum, log) => sum + log.calories, 0) / logs.length;
    const adherence = Math.round(
      clamp(100 - (Math.abs(averageCalories - plan.calorieTarget) / plan.calorieTarget) * 100, 0, 100),
    );

    return {
      currentStreak: getCurrentStreak(logs),
      adherence,
      workoutsCompleted,
    };
  }, [logs, plan.calorieTarget]);

  function updateField(field: keyof typeof form, value: string): void {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveMockEntry(): void {
    const nextEntry: MeasurementEntry = {
      date: "Today",
      weight: Number(form.weight) || latestMeasurement.weight,
      waist: Number(form.waist) || latestMeasurement.waist,
      chest: Number(form.chest) || latestMeasurement.chest,
      hips: Number(form.hips) || latestMeasurement.hips,
    };
    const nextMeasurements = [...measurements.slice(-5), nextEntry];
    setMeasurements(nextMeasurements);
    saveMeasurements(nextMeasurements);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress</h1>
          <p className="text-muted-foreground">
            Track adherence, training consistency, nutrition, and body trends.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
          <Target className="h-4 w-4 text-primary" />
          {plan.name}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current streak</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.currentStreak} days</div>
            <p className="text-sm text-muted-foreground">Training logs in a row</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plan adherence</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.adherence}%</div>
            <p className="text-sm text-muted-foreground">Average calorie target fit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts completed</CardTitle>
            <Dumbbell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.workoutsCompleted}</div>
            <p className="text-sm text-muted-foreground">Across the last 4 weeks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calories vs target</CardTitle>
            <CardDescription>Weekly average intake against {plan.calorieTarget} kcal/day</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart data={weeklyNutrition} />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-6 rounded-full bg-primary" /> Intake
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-6 border-t border-dashed border-muted-foreground" /> Target
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workout completion rate</CardTitle>
            <CardDescription>Completed sessions divided by weekly goal</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={weeklyWorkoutCompletion} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Macro breakdown</CardTitle>
            <CardDescription>Latest logged day by grams</CardDescription>
          </CardHeader>
          <CardContent>
            <MacroDonut data={macroBreakdown} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Body measurements</CardTitle>
            <CardDescription>Mock inputs update the local trend chart</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-4">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Weight</span>
                <Input value={form.weight} onChange={(event) => updateField("weight", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Waist</span>
                <Input value={form.waist} onChange={(event) => updateField("waist", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Chest</span>
                <Input value={form.chest} onChange={(event) => updateField("chest", event.target.value)} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Hips</span>
                <Input value={form.hips} onChange={(event) => updateField("hips", event.target.value)} />
              </label>
            </div>
            <Button type="button" onClick={saveMockEntry}>
              <Activity className="mr-2 h-4 w-4" />
              Save mock entry
            </Button>
            <MeasurementTrend data={measurements} />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-6 rounded-full bg-blue-600" /> Weight
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-6 rounded-full bg-green-600" /> Waist
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
