import {
  UniqueConstraintError,
  type Includeable,
  type Transaction,
} from "sequelize";
import { getDatabase } from "../lib/db";
import {
  CoachRequest,
  DayPlan,
  Exercise,
  Meal,
  MealItem,
  Program,
  User,
  Workout,
} from "../models";
import { createError } from "../middleware/error-handler";
import type {
  CreateCoachProgramInput,
  UpdateCoachProgramInput,
  UpsertProgramDayInput,
} from "../schemas/coachProgram.schemas";

/** A coach program is one dated week. Day tabs 1-7 in the builder map to these. */
const DAYS_IN_PROGRAM = 7;

const WEEKDAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const PUBLIC_USER_FIELDS = ["id", "name"] as const;

const FULL_PROGRAM_INCLUDE: Includeable[] = [
  {
    model: DayPlan,
    as: "weekPlan",
    separate: true,
    order: [["dayNumber", "ASC"]],
    include: [
      {
        model: Meal,
        as: "meals",
        separate: true,
        order: [["sortOrder", "ASC"]],
        include: [{ model: MealItem, as: "items" }],
      },
      {
        model: Workout,
        as: "workout",
        include: [
          {
            model: Exercise,
            as: "exercises",
            separate: true,
            order: [["sortOrder", "ASC"]],
          },
        ],
      },
    ],
  },
  { model: User, as: "user", attributes: [...PUBLIC_USER_FIELDS] },
];

type DayPlanWithChildren = DayPlan & {
  meals?: Meal[];
  workout?: Workout & { exercises?: Exercise[] };
};

const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/** Default start for a new program, so day 1 is never mid-week. Today, if today is a Monday. */
const nextMonday = (): string => {
  const iso = new Date().toISOString().slice(0, 10);
  const offset = (8 - new Date(`${iso}T00:00:00Z`).getUTCDay()) % 7;
  return addDays(iso, offset);
};

const weekdayLabel = (isoDate: string): string =>
  WEEKDAY_LABELS[new Date(`${isoDate}T00:00:00Z`).getUTCDay()]!;

const sum = (values: number[]): number =>
  values.reduce((total, value) => total + value, 0);

const findOwned = async (programId: string, coachId: string) => {
  const program = await Program.findOne({ where: { id: programId, coachId } });
  if (!program) throw createError("Program not found.", 404);
  return program;
};

/**
 * `SELECT … FOR UPDATE` on the program row alone — no `include`, because
 * Postgres refuses `FOR UPDATE` against the nullable side of an outer join.
 */
const lockOwned = async (
  programId: string,
  coachId: string,
  transaction: Transaction,
) => {
  const program = await Program.findOne({
    where: { id: programId, coachId },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!program) throw createError("Program not found.", 404);
  return program;
};

const getDetail = async (programId: string, coachId: string) => {
  const program = await Program.findOne({
    where: { id: programId, coachId },
    include: FULL_PROGRAM_INCLUDE,
  });
  if (!program) throw createError("Program not found.", 404);
  return program;
};

const createMeals = async (
  dayPlanId: string,
  meals: UpsertProgramDayInput["meals"],
  transaction: Transaction,
) => {
  for (const [index, meal] of meals.entries()) {
    const created = await Meal.create(
      {
        dayPlanId,
        type: meal.type,
        time: meal.time,
        sortOrder: index,
        totalCalories: sum(meal.items.map((item) => item.calories)),
        totalProtein: sum(meal.items.map((item) => item.protein)),
        totalCarbs: sum(meal.items.map((item) => item.carbs)),
        totalFat: sum(meal.items.map((item) => item.fat)),
      },
      { transaction },
    );

    await MealItem.bulkCreate(
      meal.items.map((item) => ({ ...item, mealId: created.id })),
      { transaction },
    );
  }
};

const createWorkout = async (
  dayPlanId: string,
  workout: NonNullable<UpsertProgramDayInput["workout"]>,
  transaction: Transaction,
) => {
  const created = await Workout.create(
    {
      dayPlanId,
      name: workout.name,
      type: workout.type,
      duration: workout.duration,
    },
    { transaction },
  );

  await Exercise.bulkCreate(
    workout.exercises.map((exercise, index) => ({
      workoutId: created.id,
      sortOrder: index,
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      rest: exercise.rest,
      muscle: exercise.muscle,
      notes: exercise.notes ?? null,
    })),
    { transaction },
  );
};

/**
 * Creates the draft and its seven dated days in one go. `day_plans.date` is
 * NOT NULL and the client plan view keys off real dates, so the days are
 * derived from `startDate` rather than left for the coach to fill in.
 */
const createDraft = async (coachId: string, input: CreateCoachProgramInput) => {
  const request = await CoachRequest.findOne({
    where: { id: input.coachRequestId, coachId },
  });
  if (!request) throw createError("Coach request not found.", 404);
  if (request.status !== "accepted") {
    throw createError("This request has not been accepted.", 409);
  }

  const startDate = input.startDate ?? nextMonday();
  const db = getDatabase();

  let programId: string;
  try {
    programId = await db.transaction(async (transaction) => {
      const program = await Program.create(
        {
          userId: request.userId,
          coachId,
          coachRequestId: request.id,
          status: "draft",
          title: input.title,
          goal: input.goal,
          level: input.level,
          calories: input.calories,
          duration: "1 week",
          weeks: 1,
          totalDays: DAYS_IN_PROGRAM,
          startDate,
          color: input.color ?? null,
          accent: input.accent ?? null,
          macros: input.macros ?? null,
          isCatalog: false,
        },
        { transaction },
      );

      await DayPlan.bulkCreate(
        Array.from({ length: DAYS_IN_PROGRAM }, (_, index) => {
          const date = addDays(startDate, index);
          return {
            programId: program.id,
            dayNumber: index + 1,
            label: weekdayLabel(date),
            date,
            isRestDay: false,
          };
        }),
        { transaction },
      );

      return program.id;
    });
  } catch (err) {
    // programs.coach_request_id is unique: one program per accepted request.
    if (err instanceof UniqueConstraintError) {
      throw createError("This request already has a program.", 409);
    }
    throw err;
  }

  return getDetail(programId, coachId);
};

const listForCoach = async (coachId: string) =>
  Program.findAll({
    where: { coachId },
    order: [["createdAt", "DESC"]],
    include: [{ model: User, as: "user", attributes: [...PUBLIC_USER_FIELDS] }],
  });

const updateMeta = async (
  programId: string,
  coachId: string,
  input: UpdateCoachProgramInput,
) => {
  const program = await findOwned(programId, coachId);
  await program.update(input);
  return getDetail(programId, coachId);
};

/**
 * Replaces a day's meals and workout wholesale — simpler than diffing, and the
 * child rows cascade.
 *
 * Draft-only, deliberately: `meal_logs` and `workout_logs` cascade from `meals`
 * and `workouts`, so re-saving a day of a published program would silently
 * delete what the client has already logged against it.
 */
const upsertDay = async (
  programId: string,
  coachId: string,
  dayNumber: number,
  input: UpsertProgramDayInput,
) => {
  const db = getDatabase();
  await db.transaction(async (transaction) => {
    // Locked and rechecked inside the transaction: reading the status outside
    // it lets a concurrent publish land in between, and the delete-recreate
    // below would then rewrite a program the client can already see.
    const program = await lockOwned(programId, coachId, transaction);
    if (program.status !== "draft") {
      throw createError("A published program can no longer be edited.", 409);
    }

    const dayPlan = await DayPlan.findOne({
      where: { programId, dayNumber },
      transaction,
    });
    if (!dayPlan) throw createError("Day not found.", 404);

    await dayPlan.update(
      {
        isRestDay: input.isRestDay,
        ...(input.label ? { label: input.label } : {}),
      },
      { transaction },
    );

    await Meal.destroy({ where: { dayPlanId: dayPlan.id }, transaction });
    await Workout.destroy({ where: { dayPlanId: dayPlan.id }, transaction });

    await createMeals(dayPlan.id, input.meals, transaction);
    if (!input.isRestDay && input.workout) {
      await createWorkout(dayPlan.id, input.workout, transaction);
    }
  });

  return getDetail(programId, coachId);
};

/**
 * Publishing is what makes the program visible to the client, so the
 * half-built states that are fine in a draft are rejected here.
 */
const publish = async (programId: string, coachId: string) => {
  const db = getDatabase();

  await db.transaction(async (transaction) => {
    // Same lock as the day upsert, so validating and publishing cannot be
    // interleaved with an edit that would invalidate what was just checked.
    const program = await lockOwned(programId, coachId, transaction);
    if (program.status === "published") {
      throw createError("This program is already published.", 409);
    }

    const days = (await DayPlan.findAll({
      where: { programId },
      order: [["dayNumber", "ASC"]],
      include: [
        { model: Meal, as: "meals" },
        {
          model: Workout,
          as: "workout",
          include: [{ model: Exercise, as: "exercises" }],
        },
      ],
      transaction,
    })) as DayPlanWithChildren[];

    const emptyTrainingDay = days.find(
      (day) => !day.isRestDay && !day.workout?.exercises?.length,
    );
    if (emptyTrainingDay) {
      throw createError(
        `Day ${emptyTrainingDay.dayNumber} needs a workout or must be marked as a rest day.`,
        422,
      );
    }

    if (!days.some((day) => day.meals?.length)) {
      throw createError("Add at least one meal before publishing.", 422);
    }

    await program.update({ status: "published" }, { transaction });
    if (program.coachRequestId) {
      await CoachRequest.update(
        { status: "completed", respondedAt: new Date() },
        {
          where: { id: program.coachRequestId, coachId, status: "accepted" },
          transaction,
        },
      );
    }
  });

  return getDetail(programId, coachId);
};

export const coachProgramService = {
  createDraft,
  listForCoach,
  getDetail,
  updateMeta,
  upsertDay,
  publish,
};
