import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface FitnessDailyLogAttributes {
  id: string;
  userId: string;
  planId: string;
  logDate: Date;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FitnessDailyLogCreationAttributes extends Optional<
  FitnessDailyLogAttributes,
  "id" | "note"
> {}

export class FitnessDailyLog
  extends Model<FitnessDailyLogAttributes, FitnessDailyLogCreationAttributes>
  implements FitnessDailyLogAttributes
{
  declare id: string;
  declare userId: string;
  declare planId: string;
  declare logDate: Date;
  declare calories: number;
  declare protein: number;
  declare carbs: number;
  declare fat: number;
  declare note: string | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof FitnessDailyLog {
    FitnessDailyLog.init(
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
        calories: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        protein: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        carbs: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        fat: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        note: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: "fitness_daily_logs",
        timestamps: true,
        underscored: true,
        indexes: [{ fields: ["user_id", "log_date"], unique: true }],
      },
    );
    return FitnessDailyLog;
  }
}
