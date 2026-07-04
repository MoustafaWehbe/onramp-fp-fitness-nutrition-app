import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export type MealLogStatus = "pending" | "followed" | "modified" | "skipped";

export interface MealLogAttributes {
  id: string;
  mealId: string;
  userId: string;
  status: MealLogStatus;
  note: string | null;
  actualCalories: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MealLogCreationAttributes
  extends Optional<MealLogAttributes, "id" | "status" | "note" | "actualCalories"> {}

export class MealLog
  extends Model<MealLogAttributes, MealLogCreationAttributes>
  implements MealLogAttributes
{
  declare id: string;
  declare mealId: string;
  declare userId: string;
  declare status: MealLogStatus;
  declare note: string | null;
  declare actualCalories: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof MealLog {
    MealLog.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        mealId: { type: DataTypes.UUID, allowNull: false },
        userId: { type: DataTypes.UUID, allowNull: false },
        status: {
          type: DataTypes.ENUM("pending", "followed", "modified", "skipped"),
          allowNull: false,
          defaultValue: "pending",
        },
        note: { type: DataTypes.TEXT, allowNull: true },
        actualCalories: { type: DataTypes.INTEGER, allowNull: true },
      },
      {
        sequelize,
        tableName: "meal_logs",
        timestamps: true,
        underscored: true,
      },
    );
    return MealLog;
  }
}