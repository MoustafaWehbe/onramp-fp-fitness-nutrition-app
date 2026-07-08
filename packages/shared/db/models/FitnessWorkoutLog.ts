import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface FitnessWorkoutLogAttributes {
  id: string;
  userId: string;
  planId: string;
  logDate: Date;
  workoutName: string;
  completed: boolean;
  durationMinutes?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FitnessWorkoutLogCreationAttributes extends Optional<
  FitnessWorkoutLogAttributes,
  "id" | "durationMinutes"
> {}

export class FitnessWorkoutLog
  extends Model<
    FitnessWorkoutLogAttributes,
    FitnessWorkoutLogCreationAttributes
  >
  implements FitnessWorkoutLogAttributes
{
  declare id: string;
  declare userId: string;
  declare planId: string;
  declare logDate: Date;
  declare workoutName: string;
  declare completed: boolean;
  declare durationMinutes: number | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof FitnessWorkoutLog {
    FitnessWorkoutLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE",
        },
        planId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: { model: "fitness_plans", key: "id" },
          onDelete: "CASCADE",
        },
        logDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        workoutName: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        completed: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        durationMinutes: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "fitness_workout_logs",
        timestamps: true,
        underscored: true,
        indexes: [{ fields: ["user_id", "log_date"] }],
      },
    );
    return FitnessWorkoutLog;
  }
}
