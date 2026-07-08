import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface FitnessMealLogAttributes {
  id: string;
  userId: string;
  planId: string;
  logDate: Date;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  note?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FitnessMealLogCreationAttributes extends Optional<
  FitnessMealLogAttributes,
  "id" | "note"
> {}

export class FitnessMealLog
  extends Model<FitnessMealLogAttributes, FitnessMealLogCreationAttributes>
  implements FitnessMealLogAttributes
{
  declare id: string;
  declare userId: string;
  declare planId: string;
  declare logDate: Date;
  declare mealType: string;
  declare calories: number;
  declare protein: number;
  declare carbs: number;
  declare fat: number;
  declare note: string | undefined;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof FitnessMealLog {
    FitnessMealLog.init(
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
        mealType: {
          type: DataTypes.STRING(80),
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
        tableName: "fitness_meal_logs",
        timestamps: true,
        underscored: true,
        indexes: [{ fields: ["user_id", "log_date", "meal_type"] }],
      },
    );
    return FitnessMealLog;
  }
}
