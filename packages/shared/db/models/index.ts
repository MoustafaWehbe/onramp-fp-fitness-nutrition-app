import type { Sequelize } from "sequelize";
import { User } from "./User";
import { Session } from "./Session";
import { RefreshToken } from "./RefreshToken";
import { Program } from "./Program";
import { DayPlan } from "./DayPlan";
import { Meal } from "./Meal";
import { MealItem } from "./MealItem";
import { Workout } from "./Workout";
import { Exercise } from "./Exercise";
import { MealLog } from "./MealLog";
import { WorkoutLog } from "./WorkoutLog";
import { WorkoutLogExercise } from "./WorkoutLogExercise";
import { FitnessPlan } from "./FitnessPlan";
import { FitnessDailyLog } from "./FitnessDailyLog";
import { FitnessWorkoutLog } from "./FitnessWorkoutLog";
import { FitnessMealLog } from "./FitnessMealLog";
import { FitnessBodyMeasurement } from "./FitnessBodyMeasurement";
import { FitnessAiChatMessage } from "./FitnessAiChatMessage";

export {
  User,
  Session,
  RefreshToken,
  Program,
  DayPlan,
  Meal,
  MealItem,
  Workout,
  Exercise,
  MealLog,
  WorkoutLog,
  WorkoutLogExercise,
  FitnessPlan,
  FitnessDailyLog,
  FitnessWorkoutLog,
  FitnessMealLog,
  FitnessBodyMeasurement,
  FitnessAiChatMessage,
};

export function initModels(sequelize: Sequelize): void {
  User.initModel(sequelize);
  Session.initModel(sequelize);
  RefreshToken.initModel(sequelize);
  Program.initModel(sequelize);
  DayPlan.initModel(sequelize);
  Meal.initModel(sequelize);
  MealItem.initModel(sequelize);
  Workout.initModel(sequelize);
  Exercise.initModel(sequelize);
  MealLog.initModel(sequelize);
  WorkoutLog.initModel(sequelize);
  WorkoutLogExercise.initModel(sequelize);
  FitnessPlan.initModel(sequelize);
  FitnessDailyLog.initModel(sequelize);
  FitnessWorkoutLog.initModel(sequelize);
  FitnessMealLog.initModel(sequelize);
  FitnessBodyMeasurement.initModel(sequelize);
  FitnessAiChatMessage.initModel(sequelize);

  User.hasMany(Session, { foreignKey: "userId", as: "sessions" });
  Session.belongsTo(User, { foreignKey: "userId", as: "user" });
  User.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
  RefreshToken.belongsTo(User, { foreignKey: "userId", as: "user" });
  Session.hasMany(RefreshToken, { foreignKey: "sessionId", as: "refreshTokens" });
  RefreshToken.belongsTo(Session, { foreignKey: "sessionId", as: "session" });

  User.hasMany(Program, { foreignKey: "userId", as: "programs" });
  Program.belongsTo(User, { foreignKey: "userId", as: "user" });

  Program.hasMany(DayPlan, { foreignKey: "programId", as: "weekPlan" });
  DayPlan.belongsTo(Program, { foreignKey: "programId", as: "program" });

  DayPlan.hasMany(Meal, { foreignKey: "dayPlanId", as: "meals" });
  Meal.belongsTo(DayPlan, { foreignKey: "dayPlanId", as: "dayPlan" });

  Meal.hasMany(MealItem, { foreignKey: "mealId", as: "items" });
  MealItem.belongsTo(Meal, { foreignKey: "mealId", as: "meal" });

  DayPlan.hasOne(Workout, { foreignKey: "dayPlanId", as: "workout" });
  Workout.belongsTo(DayPlan, { foreignKey: "dayPlanId", as: "dayPlan" });

  Workout.hasMany(Exercise, { foreignKey: "workoutId", as: "exercises" });
  Exercise.belongsTo(Workout, { foreignKey: "workoutId", as: "workout" });

  Meal.hasMany(MealLog, { foreignKey: "mealId", as: "logs" });
  MealLog.belongsTo(Meal, { foreignKey: "mealId", as: "meal" });
  User.hasMany(MealLog, { foreignKey: "userId", as: "mealLogs" });
  MealLog.belongsTo(User, { foreignKey: "userId", as: "user" });

  Workout.hasOne(WorkoutLog, { foreignKey: "workoutId", as: "log" });
  WorkoutLog.belongsTo(Workout, { foreignKey: "workoutId", as: "workout" });
  User.hasMany(WorkoutLog, { foreignKey: "userId", as: "workoutLogs" });
  WorkoutLog.belongsTo(User, { foreignKey: "userId", as: "user" });

  WorkoutLog.hasMany(WorkoutLogExercise, {
    foreignKey: "workoutLogId",
    as: "completedExercises",
  });
  WorkoutLogExercise.belongsTo(WorkoutLog, {
    foreignKey: "workoutLogId",
    as: "workoutLog",
  });
  Exercise.hasMany(WorkoutLogExercise, {
    foreignKey: "exerciseId",
    as: "logEntries",
  });
  WorkoutLogExercise.belongsTo(Exercise, {
    foreignKey: "exerciseId",
    as: "exercise",
  });

  User.hasMany(FitnessPlan, { foreignKey: "userId", as: "fitnessPlans" });
  FitnessPlan.belongsTo(User, { foreignKey: "userId", as: "user" });

  User.hasMany(FitnessDailyLog, {
    foreignKey: "userId",
    as: "fitnessDailyLogs",
  });
  FitnessPlan.hasMany(FitnessDailyLog, {
    foreignKey: "planId",
    as: "dailyLogs",
  });
  FitnessDailyLog.belongsTo(FitnessPlan, {
    foreignKey: "planId",
    as: "plan",
  });

  User.hasMany(FitnessWorkoutLog, {
    foreignKey: "userId",
    as: "fitnessWorkoutLogs",
  });
  FitnessPlan.hasMany(FitnessWorkoutLog, {
    foreignKey: "planId",
    as: "workoutLogs",
  });
  FitnessWorkoutLog.belongsTo(FitnessPlan, {
    foreignKey: "planId",
    as: "plan",
  });

  User.hasMany(FitnessMealLog, {
    foreignKey: "userId",
    as: "fitnessMealLogs",
  });
  FitnessPlan.hasMany(FitnessMealLog, { foreignKey: "planId", as: "mealLogs" });
  FitnessMealLog.belongsTo(FitnessPlan, { foreignKey: "planId", as: "plan" });

  User.hasMany(FitnessBodyMeasurement, {
    foreignKey: "userId",
    as: "fitnessBodyMeasurements",
  });

  User.hasMany(FitnessAiChatMessage, {
    foreignKey: "userId",
    as: "fitnessAiChatMessages",
  });
  FitnessPlan.hasMany(FitnessAiChatMessage, {
    foreignKey: "planId",
    as: "aiChatMessages",
  });
  FitnessAiChatMessage.belongsTo(FitnessPlan, {
    foreignKey: "planId",
    as: "plan",
  });
}
