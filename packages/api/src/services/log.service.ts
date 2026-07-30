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
      const existingMealLog = await MealLog.findOne({
        where: { mealId: m.mealId, userId },
      });
      const values = {
        status: m.status,
        note: m.note ?? null,
        actualCalories: m.actualCalories ?? null,
      };

      if (existingMealLog) {
        await existingMealLog.update(values);
      } else {
        await MealLog.create({
          mealId: m.mealId,
          userId,
          ...values,
        });
      }
    }

    if (workout) {
      const existingWorkoutLog = await WorkoutLog.findOne({
        where: { workoutId: workout.workoutId, userId },
      });
      const values = {
        status: workout.status,
        note: workout.note ?? null,
      };
      const workoutLog = existingWorkoutLog
        ? await existingWorkoutLog.update(values)
        : await WorkoutLog.create({
            workoutId: workout.workoutId,
            userId,
            ...values,
          });

      if (!workoutLog) {
        throw new Error("Workout log could not be saved");
      }

      // Reset all exercise completions for this log, then mark the ones sent as completed.
      // Simple + correct approach for a small list of exercises per workout.
      const allExercises = await Exercise.findAll({
        where: { workoutId: workout.workoutId },
        attributes: ["id"],
      });

      await WorkoutLogExercise.destroy({
        where: { workoutLogId: workoutLog.id },
      });

      await WorkoutLogExercise.bulkCreate(
        allExercises.map((ex) => ({
          workoutLogId: workoutLog.id,
          exerciseId: ex.id,
          completed: workout.completedExerciseIds.includes(ex.id),
        })),
      );
    }

    return { success: true };
  },
};
