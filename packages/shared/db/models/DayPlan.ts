import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface DayPlanAttributes {
  id: string;
  programId: string;
  dayNumber: number;
  label: string;
  date: string;
  isRestDay: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DayPlanCreationAttributes
  extends Optional<DayPlanAttributes, "id" | "isRestDay"> {}

export class DayPlan
  extends Model<DayPlanAttributes, DayPlanCreationAttributes>
  implements DayPlanAttributes
{
  declare id: string;
  declare programId: string;
  declare dayNumber: number;
  declare label: string;
  declare date: string;
  declare isRestDay: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof DayPlan {
    DayPlan.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        programId: { type: DataTypes.UUID, allowNull: false },
        dayNumber: { type: DataTypes.INTEGER, allowNull: false },
        label: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATEONLY, allowNull: false },
        isRestDay: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      },
      {
        sequelize,
        tableName: "day_plans",
        timestamps: true,
        underscored: true,
      },
    );
    return DayPlan;
  }
}