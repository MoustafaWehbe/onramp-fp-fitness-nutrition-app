import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface WorkoutLogExerciseAttributes {
  id: string;
  workoutLogId: string;
  exerciseId: string;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutLogExerciseCreationAttributes
  extends Optional<WorkoutLogExerciseAttributes, "id" | "completed"> {}

export class WorkoutLogExercise
  extends Model<WorkoutLogExerciseAttributes, WorkoutLogExerciseCreationAttributes>
  implements WorkoutLogExerciseAttributes
{
  declare id: string;
  declare workoutLogId: string;
  declare exerciseId: string;
  declare completed: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof WorkoutLogExercise {
    WorkoutLogExercise.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        workoutLogId: { type: DataTypes.UUID, allowNull: false },
        exerciseId: { type: DataTypes.UUID, allowNull: false },
        completed: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      },
      {
        sequelize,
        tableName: "workout_log_exercises",
        timestamps: true,
        underscored: true,
      },
    );
    return WorkoutLogExercise;
  }
}