import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Dumbbell,
  Flame,
  Loader2,
  Utensils,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { Badge } from "../../components/ui/badge";
import { Button, buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { NotFound } from "../NotFound";
import {
  fetchProgramDetail,
  formatProgramLabel,
  type ProgramCatalogItem,
} from "../../lib/program-api";

export const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<ProgramCatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const loadProgram = useCallback(async () => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      setProgram(await fetchProgramDetail(slug));
    } catch {
      setError("Program details could not be loaded from PostgreSQL.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadProgram();
  }, [loadProgram]);

  if (notFound) {
    return <NotFound />;
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-5 w-36 animate-pulse bg-muted" />
        <div className="h-72 animate-pulse bg-card" />
        <div className="space-y-3">
          <div className="h-10 w-2/3 animate-pulse bg-muted" />
          <div className="h-5 w-1/2 animate-pulse bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex min-h-[460px] flex-col items-center justify-center gap-3 border border-dashed border-border text-center">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <p className="font-heading text-lg font-bold uppercase">
          {error ?? "Program not found"}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page only renders records returned by the authenticated API.
        </p>
        <Button onClick={() => void loadProgram()} className="gap-2">
          <Loader2 className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        to={ROUTES.programs}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to programs
      </Link>

      <div
        className="relative min-h-[280px] overflow-hidden bg-ink text-white"
        style={{
          background: `radial-gradient(circle at 20% 20%, ${program.accent ?? "#6ef362"} 0, transparent 30%), linear-gradient(135deg, ${program.color ?? "#111827"}, #050505 72%)`,
        }}
      >
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="absolute left-0 top-0 flex gap-2 p-4">
          <Badge>{formatProgramLabel(program.goal)}</Badge>
          <Badge variant="dark">{formatProgramLabel(program.level)}</Badge>
        </div>
        <div className="relative flex h-full min-h-[280px] flex-col justify-end p-6 sm:p-8">
          <p className="eyebrow text-white/60">Database program</p>
          <h1 className="mt-2 max-w-3xl font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
            {program.title}
          </h1>
          <p className="mt-3 max-w-2xl text-white/70">{program.description}</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            Week {program.currentWeek}, day {program.currentDay}
          </span>
          <span>/</span>
          <span>
            {program.completedDays} of {program.totalDays} days complete
          </span>
        </div>
        <h1 className="font-display text-4xl uppercase tracking-tight">
          {program.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {program.description}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col items-center gap-1 border border-border p-5">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-semibold">{program.durationWeeks} weeks</span>
        </div>
        <div className="flex flex-col items-center gap-1 border border-border p-5">
          <Dumbbell className="h-5 w-5 text-primary" />
          <span className="font-semibold">
            {program.daysPerWeek}x / week
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 border border-border p-5">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-semibold">{program.dailyCalories} kcal/day</span>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="font-heading text-2xl font-bold uppercase">Week plan</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {program.sampleWeek.map((day) => (
            <div key={day.id} className="border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold uppercase">
                  Day {day.dayNumber}
                </span>
                {day.workout && (
                  <span className="text-xs text-muted-foreground">
                    {day.workout.duration}
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium">
                {day.workout?.name ?? day.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {day.workout
                  ? `${day.workout.type} / ${day.workout.exerciseCount} exercises`
                  : `${day.mealCount} planned meals`}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold uppercase">
          <Utensils className="h-5 w-5 text-primary" />
          Planned meals
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {program.sampleMeals.map((meal) => (
            <div
              key={meal.id}
              className="flex items-center justify-between gap-4 border border-border p-4"
            >
              <div>
                <p className="font-medium capitalize">{meal.type}</p>
                <p className="text-sm text-muted-foreground">
                  {meal.items
                    .map((item) => `${item.name} ${item.quantity}`)
                    .join(", ")}
                </p>
              </div>
              <span className="shrink-0 font-semibold">
                {meal.totalCalories} kcal
              </span>
            </div>
          ))}
        </div>
      </section>

      <Link
        to={ROUTES.myPlan}
        className={cn(buttonVariants(), "w-full sm:w-auto")}
      >
        Open my plan
      </Link>
    </div>
  );
};
