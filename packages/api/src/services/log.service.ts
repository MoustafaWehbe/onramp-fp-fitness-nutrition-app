import {Meal,MealLog,Workout,WorkoutLog,WorkoutLogExercise,Exercise} from "../models";

interface MealLogInput {
  mealId: string;
  status: "pending" | "followed" | "modified" | "skipped";
  note?: string;
  actualCalories?: number | null;
}

interface WorkoutLogInput {
  workoutId: string;
  status: "pending" | "completed" | "skipped" | "modified";
  note?: string;
  completedExerciseIds: string[];
}

interface SaveLogsInput {
  userId: string;
  meals: MealLogInput[];
  workout?: WorkoutLogInput | null;
}

export const logService = {
  async getLogsForDay(dayPlanId: string, userId: string) {
    const meals = await Meal.findAll({
      where: { dayPlanId },
      attributes: ["id"],
    });
    const mealIds = meals.map((m) => m.id);

    const mealLogs = await MealLog.findAll({
      where: { mealId: mealIds, userId },
    });

    const workout = await Workout.findOne({ where: { dayPlanId } });
    let workoutLog = null;
    let completedExerciseIds: string[] = [];

    if (workout) {
      workoutLog = await WorkoutLog.findOne({
        where: { workoutId: workout.id, userId },
      });
      if (workoutLog) {
        const completedRows = await WorkoutLogExercise.findAll({
          where: { workoutLogId: workoutLog.id, completed: true },
          attributes: ["exerciseId"],
        });
        completedExerciseIds = completedRows.map((r) => r.exerciseId);
      }
    }

    return { mealLogs, workoutLog, completedExerciseIds };
  },

  // Batch save — called once when the user clicks "Save Log"
  async saveLogs(input: SaveLogsInput) {
    const { userId, meals, workout } = input;

    // Upsert each meal log (insert or update if one already exists for this user+meal)
    for (const m of meals) {
      await MealLog.upsert({
        mealId: m.mealId,
        userId,
        status: m.status,
        note: m.note ?? null,
        actualCalories: m.actualCalories ?? null,
      });
    }

    if (workout) {
      const [workoutLog] = await WorkoutLog.upsert({
        workoutId: workout.workoutId,
        userId,
        status: workout.status,
        note: workout.note ?? null,
      });

      // Reset all exercise completions for this log, then mark the ones sent as completed.
      // Simple + correct approach for a small list of exercises per workout.
      const allExercises = await Exercise.findAll({
        where: { workoutId: workout.workoutId },
        attributes: ["id"],
      });

      for (const ex of allExercises) {
        await WorkoutLogExercise.upsert({
          workoutLogId: workoutLog.id,
          exerciseId: ex.id,
          completed: workout.completedExerciseIds.includes(ex.id),
        });
      }
    }

    return { success: true };
  },
};