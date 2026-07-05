import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export type WorkoutLogStatus = "pending" | "completed" | "skipped" | "modified";

export interface WorkoutLogAttributes {
  id: string;
  workoutId: string;
  userId: string;
  status: WorkoutLogStatus;
  note: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutLogCreationAttributes
  extends Optional<WorkoutLogAttributes, "id" | "status" | "note"> {}

export class WorkoutLog
  extends Model<WorkoutLogAttributes, WorkoutLogCreationAttributes>
  implements WorkoutLogAttributes
{
  declare id: string;
  declare workoutId: string;
  declare userId: string;
  declare status: WorkoutLogStatus;
  declare note: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof WorkoutLog {
    WorkoutLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        workoutId: { type: DataTypes.UUID, allowNull: false },
        userId: { type: DataTypes.UUID, allowNull: false },
        status: {
          type: DataTypes.ENUM("pending", "completed", "skipped", "modified"),
          allowNull: false,
          defaultValue: "pending",
        },
        note: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize,
        tableName: "workout_logs",
        timestamps: true,
        underscored: true,
      },
    );
    return WorkoutLog;
  }
}