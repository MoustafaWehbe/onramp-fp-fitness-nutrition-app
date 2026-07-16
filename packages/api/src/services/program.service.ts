import { DayPlan, Exercise, Meal, MealItem, Program, Workout } from "../models";

type DayPlanWithPreview = DayPlan & {
  meals?: Array<Meal & { items?: MealItem[] }>;
  workout?: Workout & { exercises?: Exercise[] };
};

type ProgramWithWeekPlan = Program & {
  weekPlan?: DayPlanWithPreview[];
};

function formatProgram(program: ProgramWithWeekPlan) {
  const weekPlan = [...(program.weekPlan ?? [])].sort(
    (a, b) => a.dayNumber - b.dayNumber,
  );
  const workoutDays = weekPlan.filter((day) => day.workout);
  const meals = weekPlan.flatMap((day) => day.meals ?? []);
  const focus = Array.from(
    new Set(
      workoutDays
        .map((day) => day.workout?.type)
        .filter((type): type is string => Boolean(type)),
    ),
  );

  return {
    id: program.id,
    slug: program.id,
    title: program.title,
    goal: program.goal,
    level: program.level,
    duration: program.duration,
    durationWeeks: program.weeks,
    daysPerWeek: workoutDays.length,
    dailyCalories: program.calories,
    color: program.color,
    accent: program.accent,
    startDate: program.startDate,
    currentWeek: program.currentWeek,
    currentDay: program.currentDay,
    completedDays: program.completedDays,
    totalDays: program.totalDays,
    adherenceRate: program.adherenceRate,
    mealCount: meals.length,
    workoutCount: workoutDays.length,
    focus,
    tagline: `${program.goal} / ${program.duration}`,
    description: `${program.level} ${program.goal.toLowerCase()} program with ${workoutDays.length} weekly workouts, ${meals.length} planned meals, and a ${program.calories} kcal daily target.`,
    sampleWeek: weekPlan.map((day) => ({
      id: day.id,
      dayNumber: day.dayNumber,
      label: day.label,
      date: day.date,
      isRestDay: day.isRestDay,
      mealCount: day.meals?.length ?? 0,
      workout: day.workout
        ? {
            id: day.workout.id,
            name: day.workout.name,
            type: day.workout.type,
            duration: day.workout.duration,
            exerciseCount: day.workout.exercises?.length ?? 0,
          }
        : null,
    })),
    sampleMeals: meals.slice(0, 6).map((meal) => ({
      id: meal.id,
      type: meal.type,
      time: meal.time,
      totalCalories: meal.totalCalories,
      totalProtein: meal.totalProtein,
      totalCarbs: meal.totalCarbs,
      totalFat: meal.totalFat,
      items: (meal.items ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
      })),
    })),
  };
}

export const programService = {
  async getPrograms(userId?: string) {
    const programs = await Program.findAll({
      where: userId ? { userId } : undefined,
      order: [["createdAt", "DESC"]],
      include: [
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
      ],
    });

    return programs.map((program) => formatProgram(program as ProgramWithWeekPlan));
  },

  async getActiveProgram(userId: string) {
    const program = await Program.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    if (!program) throw new Error("No active program found");
    return program;
  },

  async getProgramDetail(programId: string) {
    const program = await Program.findOne({
      where: { id: programId },
      include: [
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
      ],
    });

    if (!program) throw new Error("Program not found");
    return formatProgram(program as ProgramWithWeekPlan);
  },

  async getDayPlans(programId: string) {
    const dayPlans = await DayPlan.findAll({
      where: { programId },
      order: [["dayNumber", "ASC"]],
      attributes: ["id", "dayNumber", "label", "date", "isRestDay"],
    });
    return dayPlans;
  },
};
