import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Dumbbell,
  Flame,
  Loader2,
  Star,
  Utensils,
} from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { apiClient } from "../../lib/api-client";
import { GOAL_LABELS, LEVEL_LABELS, type Program } from "../../mocks/types";
import { Badge } from "../../components/ui/badge";
import { buttonVariants } from "../../components/ui/button";
import { cn } from "../../lib/utils";
import { NotFound } from "../NotFound";

export const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    apiClient
      .get<{ data: Program }>(`/programs/catalog/${slug}`)
      .then(({ data }) => {
        if (!cancelled) setProgram(data.data);
      })
      .catch(() => {
        if (!cancelled) setProgram(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!program) {
    return <NotFound />;
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

      <div className="relative aspect-[16/7] overflow-hidden">
        <img
          src={program.image}
          alt={program.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-0 top-0 flex gap-2 p-4">
          <Badge>{GOAL_LABELS[program.goal]}</Badge>
          <Badge variant="dark">{LEVEL_LABELS[program.level]}</Badge>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 fill-primary text-primary" />
          <span className="font-semibold text-foreground">
            {program.rating}
          </span>
          <span>· {program.enrolled.toLocaleString()} enrolled</span>
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
        <h2 className="font-heading text-2xl font-bold uppercase">
          Sample week
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {program.sampleWeek.map((day) => (
            <div key={day.day} className="border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold uppercase">
                  {day.day}
                </span>
                {!day.rest && (
                  <span className="text-xs text-muted-foreground">
                    {day.durationMin} min
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm font-medium">{day.title}</p>
              <p className="text-sm text-muted-foreground">{day.focus}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 font-heading text-2xl font-bold uppercase">
          <Utensils className="h-5 w-5 text-primary" />
          Sample meals
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {program.sampleMeals.map((meal) => (
            <div
              key={meal.name}
              className="flex items-center justify-between border border-border p-4"
            >
              <div>
                <p className="font-medium">{meal.name}</p>
                <p className="text-sm text-muted-foreground">{meal.items}</p>
              </div>
              <span className="font-semibold">{meal.calories} kcal</span>
            </div>
          ))}
        </div>
      </section>

      <Link
        to={ROUTES.programs}
        className={cn(buttonVariants(), "w-full sm:w-auto")}
      >
        Start this program
      </Link>
    </div>
  );
};
