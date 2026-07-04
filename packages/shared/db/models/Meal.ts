import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export type MealType = "breakfast" | "snack" | "lunch" | "dinner";

export interface MealAttributes {
  id: string;
  dayPlanId: string;
  type: MealType;
  sortOrder: number;
  time: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MealCreationAttributes
  extends Optional<
    MealAttributes,
    "id" | "sortOrder" | "totalCalories" | "totalProtein" | "totalCarbs" | "totalFat"
  > {}

export class Meal
  extends Model<MealAttributes, MealCreationAttributes>
  implements MealAttributes
{
  declare id: string;
  declare dayPlanId: string;
  declare type: MealType;
  declare sortOrder: number;
  declare time: string;
  declare totalCalories: number;
  declare totalProtein: number;
  declare totalCarbs: number;
  declare totalFat: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Meal {
    Meal.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        dayPlanId: { type: DataTypes.UUID, allowNull: false },
        type: {
          type: DataTypes.ENUM("breakfast", "snack", "lunch", "dinner"),
          allowNull: false,
        },
        sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        time: { type: DataTypes.STRING, allowNull: false },
        totalCalories: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        totalProtein: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        totalCarbs: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        totalFat: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      },
      {
        sequelize,
        tableName: "meals",
        timestamps: true,
        underscored: true,
      },
    );
    return Meal;
  }
}