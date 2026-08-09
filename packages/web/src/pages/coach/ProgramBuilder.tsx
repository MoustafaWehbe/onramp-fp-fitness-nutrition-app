import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Send, Trash2 } from "lucide-react";
import { ROUTES } from "../../constants/routes";
import { useCoachProgram } from "../../hooks/useCoachProgram";
import { apiErrorMessage } from "../../lib/api-error";
import type {
  ApiBuilderDayInput,
  ApiBuilderExercise,
  ApiBuilderMeal,
  ApiBuilderMealItem,
  ApiBuilderWorkout,
  ApiCoachProgramDay,
} from "../../lib/api-types";

const MEAL_TYPES = ["breakfast", "snack", "lunch", "dinner"] as const;
const MACROS = ["calories", "protein", "carbs", "fat"] as const;

const emptyItem = (): ApiBuilderMealItem => ({
  name: "",
  quantity: "",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
});

const emptyMeal = (): ApiBuilderMeal => ({
  type: "breakfast",
  time: "08:00",
  items: [emptyItem()],
});

const emptyExercise = (): ApiBuilderExercise => ({
  name: "",
  sets: 3,
  reps: "10",
  rest: "60s",
  muscle: "",
  notes: "",
});

/** Strips the ids the API returns, leaving only what the day upsert accepts. */
const toDraft = (day: ApiCoachProgramDay | undefined): ApiBuilderDayInput => ({
  label: day?.label,
  isRestDay: day?.isRestDay ?? false,
  meals: (day?.meals ?? []).map((meal) => ({
    type: meal.type,
    time: meal.time,
    items: meal.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    })),
  })),
  workout: day?.workout
    ? {
        name: day.workout.name,
        type: day.workout.type,
        duration: day.workout.duration,
        exercises: day.workout.exercises.map((exercise) => ({
          name: exercise.name,
          sets: exercise.sets,
          reps: exercise.reps,
          rest: exercise.rest,
          muscle: exercise.muscle,
          notes: exercise.notes ?? "",
        })),
      }
    : null,
});

const field =
  "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50";

export const ProgramBuilder = () => {
  const { programId } = useParams();
  const { program, isLoading, error, saveDay, publish } = useCoachProgram(programId);

  const [dayNumber, setDayNumber] = useState(1);
  const [draft, setDraft] = useState<ApiBuilderDayInput>(toDraft(undefined));
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isPublished = program?.status === "published";
  const currentDay = program?.weekPlan?.find((day) => day.dayNumber === dayNumber);
  const saved = toDraft(currentDay);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    setDraft(toDraft(currentDay));
    setMessage(null);
    setFormError(null);
  }, [currentDay]);

  // Every helper writes through the updater form: several fields can change in
  // one React batch, and reading `draft` from the closure would drop all but
  // the last write.
  const patchDraft = (patch: Partial<ApiBuilderDayInput>) =>
    setDraft((previous) => ({ ...previous, ...patch }));

  const patchWorkout = (patch: Partial<ApiBuilderWorkout>) =>
    setDraft((previous) =>
      previous.workout
        ? { ...previous, workout: { ...previous.workout, ...patch } }
        : previous,
    );

  const mapMeals = (
    mapper: (meal: ApiBuilderMeal, index: number) => ApiBuilderMeal,
  ) => setDraft((previous) => ({ ...previous, meals: previous.meals.map(mapper) }));

  const patchMeal = (index: number, patch: Partial<ApiBuilderMeal>) =>
    mapMeals((meal, i) => (i === index ? { ...meal, ...patch } : meal));

  const setItem = (
    mealIndex: number,
    itemIndex: number,
    next: ApiBuilderMealItem,
  ) =>
    mapMeals((meal, i) =>
      i === mealIndex
        ? {
            ...meal,
            items: meal.items.map((item, j) => (j === itemIndex ? next : item)),
          }
        : meal,
    );

  const patchItem = (
    mealIndex: number,
    itemIndex: number,
    patch: Partial<ApiBuilderMealItem>,
  ) =>
    mapMeals((meal, i) =>
      i === mealIndex
        ? {
            ...meal,
            items: meal.items.map((item, j) =>
              j === itemIndex ? { ...item, ...patch } : item,
            ),
          }
        : meal,
    );

  const patchExercise = (index: number, patch: Partial<ApiBuilderExercise>) =>
    setDraft((previous) =>
      previous.workout
        ? {
            ...previous,
            workout: {
              ...previous.workout,
              exercises: previous.workout.exercises.map((exercise, i) =>
                i === index ? { ...exercise, ...patch } : exercise,
              ),
            },
          }
        : previous,
    );

  const addMeal = () =>
    setDraft((previous) => ({ ...previous, meals: [...previous.meals, emptyMeal()] }));

  const removeMeal = (index: number) =>
    setDraft((previous) => ({
      ...previous,
      meals: previous.meals.filter((_, i) => i !== index),
    }));

  const addItem = (mealIndex: number) =>
    mapMeals((meal, i) =>
      i === mealIndex ? { ...meal, items: [...meal.items, emptyItem()] } : meal,
    );

  const addExercise = () =>
    setDraft((previous) =>
      previous.workout
        ? {
            ...previous,
            workout: {
              ...previous.workout,
              exercises: [...previous.workout.exercises, emptyExercise()],
            },
          }
        : previous,
    );

  const toggleRestDay = (isRestDay: boolean) =>
    setDraft((previous) => ({
      ...previous,
      isRestDay,
      workout: isRestDay ? null : previous.workout,
    }));

  const handleSave = async () => {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);
    try {
      await saveDay(dayNumber, draft);
      setMessage("Day saved.");
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not save this day"));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    setIsSaving(true);
    setFormError(null);
    setMessage(null);
    try {
      await publish();
      setMessage("Published — the client can now see this plan.");
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not publish"));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <p className="p-6 text-slate-500">Loading…</p>;
  if (error || !program) return <p className="p-6 text-red-600">{error ?? "Not found"}</p>;

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to={ROUTES.coachPrograms}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All programs
          </Link>
          <h1 className="mt-1 font-heading text-2xl font-bold text-slate-950">
            {program.title}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {program.user?.name ?? "Client"} · {program.goal} · {program.calories} kcal
            {program.startDate ? ` · starts ${program.startDate}` : ""}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePublish}
          disabled={isSaving || isPublished}
          className="inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          {isPublished ? "Published" : "Publish"}
        </button>
      </header>

      {isPublished && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This program is published and can no longer be edited — the client may
          already have logged meals and workouts against it.
        </p>
      )}

      <nav className="flex flex-wrap gap-2">
        {(program.weekPlan ?? []).map((day) => (
          <button
            key={day.id}
            type="button"
            onClick={() => setDayNumber(day.dayNumber)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
              day.dayNumber === dayNumber
                ? "bg-slate-950 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-white"
            }`}
          >
            {day.label}
            <span className="ml-1.5 font-normal opacity-70">{day.date.slice(5)}</span>
          </button>
        ))}
      </nav>

      {isDirty && !isPublished && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Unsaved changes on {saved.label ?? `day ${dayNumber}`} — switching days
          will discard them.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          checked={draft.isRestDay}
          disabled={isPublished}
          onChange={(e) => toggleRestDay(e.target.checked)}
        />
        Rest day
      </label>

      <section className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-950">Meals</h2>
          <button
            type="button"
            disabled={isPublished || draft.meals.length >= 6}
            onClick={addMeal}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
            Add meal
          </button>
        </div>

        {draft.meals.length === 0 && (
          <p className="text-sm text-slate-500">No meals for this day yet.</p>
        )}

        {draft.meals.map((meal, mealIndex) => (
          <div key={mealIndex} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="text-xs">
                <span className="font-medium text-slate-600">Type</span>
                <select
                  value={meal.type}
                  disabled={isPublished}
                  onChange={(e) =>
                    patchMeal(mealIndex, {
                      type: e.target.value as ApiBuilderMeal["type"],
                    })
                  }
                  className={field}
                >
                  {MEAL_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs">
                <span className="font-medium text-slate-600">Time</span>
                <input
                  value={meal.time}
                  disabled={isPublished}
                  onChange={(e) => patchMeal(mealIndex, { time: e.target.value })}
                  className={field}
                />
              </label>

              <button
                type="button"
                disabled={isPublished}
                onClick={() => removeMeal(mealIndex)}
                className="ml-auto text-slate-400 hover:text-red-600 disabled:opacity-40"
                aria-label="Remove meal"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {meal.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="grid grid-cols-2 gap-2 sm:grid-cols-7 sm:items-center"
                >
                  <input
                    placeholder="Food"
                    value={item.name}
                    disabled={isPublished}
                    onChange={(e) =>
                      patchItem(mealIndex, itemIndex, { name: e.target.value })
                    }
                    className={`${field} sm:col-span-2`}
                  />
                  <input
                    placeholder="Qty"
                    value={item.quantity}
                    disabled={isPublished}
                    onChange={(e) =>
                      patchItem(mealIndex, itemIndex, { quantity: e.target.value })
                    }
                    className={field}
                  />
                  {MACROS.map((macro) => (
                    <input
                      key={macro}
                      type="number"
                      placeholder={macro}
                      value={item[macro]}
                      disabled={isPublished}
                      onChange={(e) =>
                        setItem(mealIndex, itemIndex, {
                          ...item,
                          [macro]: Number(e.target.value),
                        })
                      }
                      className={field}
                    />
                  ))}
                </div>
              ))}

              <button
                type="button"
                disabled={isPublished}
                onClick={() => addItem(mealIndex)}
                className="text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                + Add item
              </button>
            </div>
          </div>
        ))}
      </section>

      {!draft.isRestDay && (
        <section className="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-950">Workout</h2>
            {draft.workout ? (
              <button
                type="button"
                disabled={isPublished}
                onClick={() => patchDraft({ workout: null })}
                className="text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                disabled={isPublished}
                onClick={() =>
                  patchDraft({
                    workout: {
                      name: "",
                      type: "",
                      duration: "45 min",
                      exercises: [emptyExercise()],
                    },
                  })
                }
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                Add workout
              </button>
            )}
          </div>

          {draft.workout && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  placeholder="Name"
                  value={draft.workout.name}
                  disabled={isPublished}
                  onChange={(e) => patchWorkout({ name: e.target.value })}
                  className={field}
                />
                <input
                  placeholder="Focus (e.g. Upper body)"
                  value={draft.workout.type}
                  disabled={isPublished}
                  onChange={(e) => patchWorkout({ type: e.target.value })}
                  className={field}
                />
                <input
                  placeholder="Duration"
                  value={draft.workout.duration}
                  disabled={isPublished}
                  onChange={(e) => patchWorkout({ duration: e.target.value })}
                  className={field}
                />
              </div>

              <div className="space-y-2">
                {draft.workout.exercises.map((exercise, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-2 sm:grid-cols-6 sm:items-center"
                  >
                    <input
                      placeholder="Exercise"
                      value={exercise.name}
                      disabled={isPublished}
                      onChange={(e) => patchExercise(index, { name: e.target.value })}
                      className={`${field} sm:col-span-2`}
                    />
                    <input
                      type="number"
                      placeholder="Sets"
                      value={exercise.sets}
                      disabled={isPublished}
                      onChange={(e) =>
                        patchExercise(index, { sets: Number(e.target.value) })
                      }
                      className={field}
                    />
                    <input
                      placeholder="Reps"
                      value={exercise.reps}
                      disabled={isPublished}
                      onChange={(e) => patchExercise(index, { reps: e.target.value })}
                      className={field}
                    />
                    <input
                      placeholder="Rest"
                      value={exercise.rest}
                      disabled={isPublished}
                      onChange={(e) => patchExercise(index, { rest: e.target.value })}
                      className={field}
                    />
                    <input
                      placeholder="Muscle"
                      value={exercise.muscle}
                      disabled={isPublished}
                      onChange={(e) => patchExercise(index, { muscle: e.target.value })}
                      className={field}
                    />
                  </div>
                ))}

                <button
                  type="button"
                  disabled={isPublished}
                  onClick={addExercise}
                  className="text-xs font-semibold text-slate-600 disabled:opacity-40"
                >
                  + Add exercise
                </button>
              </div>
            </>
          )}
        </section>
      )}

      {formError && <p className="text-sm text-red-600">{formError}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}

      <button
        type="button"
        onClick={handleSave}
        disabled={isSaving || isPublished}
        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Save day"}
      </button>
    </div>
  );
};
