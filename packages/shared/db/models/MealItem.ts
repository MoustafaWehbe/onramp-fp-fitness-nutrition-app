import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface MealItemAttributes {
  id: string;
  mealId: string;
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MealItemCreationAttributes extends Optional<MealItemAttributes, "id"> {}

export class MealItem
  extends Model<MealItemAttributes, MealItemCreationAttributes>
  implements MealItemAttributes
{
  declare id: string;
  declare mealId: string;
  declare name: string;
  declare quantity: string;
  declare calories: number;
  declare protein: number;
  declare carbs: number;
  declare fat: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof MealItem {
    MealItem.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        mealId: { type: DataTypes.UUID, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        quantity: { type: DataTypes.STRING, allowNull: false },
        calories: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        protein: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        carbs: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
        fat: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
      },
      {
        sequelize,
        tableName: "meal_items",
        timestamps: true,
        underscored: true,
      },
    );
    return MealItem;
  }
}