import { z } from "zod";
import { calendarDate } from "./coach.schemas";

const macros = z.object({
  protein: z.number().min(0).max(2_000),
  carbs: z.number().min(0).max(2_000),
  fat: z.number().min(0).max(2_000),
});

/**
 * Per-item macros. Meal and program totals are summed from these rather than
 * accepted from the client, so a displayed total can never disagree with the
 * items it is a total of.
 */
const mealItem = z.object({
  name: z.string().trim().min(1).max(120),
  quantity: z.string().trim().min(1).max(60),
  calories: z.number().int().min(0).max(10_000),
  protein: z.number().min(0).max(2_000),
  carbs: z.number().min(0).max(2_000),
  fat: z.number().min(0).max(2_000),
});

const meal = z.object({
  type: z.enum(["breakfast", "snack", "lunch", "dinner"]),
  time: z.string().trim().min(1).max(20),
  items: z.array(mealItem).min(1).max(20),
});

const exercise = z.object({
  name: z.string().trim().min(1).max(120),
  sets: z.number().int().min(1).max(50),
  reps: z.string().trim().min(1).max(40),
  rest: z.string().trim().min(1).max(40),
  muscle: z.string().trim().min(1).max(60),
  notes: z.string().trim().max(500).nullish(),
});

const workout = z.object({
  name: z.string().trim().min(1).max(120),
  type: z.string().trim().min(1).max(60),
  duration: z.string().trim().min(1).max(40),
  exercises: z.array(exercise).min(1).max(30),
});

export const createCoachProgramSchema = z.object({
  coachRequestId: z.string().uuid(),
  title: z.string().trim().min(2).max(120),
  goal: z.string().trim().min(2).max(120),
  level: z.string().trim().min(2).max(60),
  calories: z.number().int().min(0).max(20_000),
  startDate: calendarDate.optional(),
  color: z.string().trim().max(40).nullish(),
  accent: z.string().trim().max(40).nullish(),
  macros: macros.nullish(),
});

export const updateCoachProgramSchema = z.object({
  title: z.string().trim().min(2).max(120).optional(),
  goal: z.string().trim().min(2).max(120).optional(),
  level: z.string().trim().min(2).max(60).optional(),
  calories: z.number().int().min(0).max(20_000).optional(),
  color: z.string().trim().max(40).nullish(),
  accent: z.string().trim().max(40).nullish(),
  macros: macros.nullish(),
});

/**
 * A rest day carries no workout. Meals are still allowed — a client eats on
 * rest days too.
 */
export const upsertProgramDaySchema = z
  .object({
    label: z.string().trim().min(1).max(60).optional(),
    isRestDay: z.boolean().default(false),
    meals: z.array(meal).max(6).default([]),
    workout: workout.nullish(),
  })
  .refine(
    (day) => !(day.isRestDay && day.workout),
    "A rest day cannot have a workout",
  );

export const programIdSchema = z.object({
  programId: z.string().uuid(),
});

export const programDayParamsSchema = z.object({
  programId: z.string().uuid(),
  dayNumber: z.coerce.number().int().min(1).max(7),
});

export type CreateCoachProgramInput = z.infer<typeof createCoachProgramSchema>;
export type UpdateCoachProgramInput = z.infer<typeof updateCoachProgramSchema>;
export type UpsertProgramDayInput = z.infer<typeof upsertProgramDaySchema>;
