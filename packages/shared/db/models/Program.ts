import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface ProgramAttributes {
  id: string;
  userId: string;
  title: string;
  goal: string;
  duration: string;
  weeks: number;
  level: string;
  calories: number;
  color: string | null;
  accent: string | null;
  startDate: string;
  currentWeek: number;
  currentDay: number;
  completedDays: number;
  totalDays: number;
  adherenceRate: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProgramCreationAttributes
  extends Optional<
    ProgramAttributes,
    "id" | "currentWeek" | "currentDay" | "completedDays" | "adherenceRate"
  > {}

export class Program
  extends Model<ProgramAttributes, ProgramCreationAttributes>
  implements ProgramAttributes
{
  declare id: string;
  declare userId: string;
  declare title: string;
  declare goal: string;
  declare duration: string;
  declare weeks: number;
  declare level: string;
  declare calories: number;
  declare color: string | null;
  declare accent: string | null;
  declare startDate: string;
  declare currentWeek: number;
  declare currentDay: number;
  declare completedDays: number;
  declare totalDays: number;
  declare adherenceRate: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Program {
    Program.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: { type: DataTypes.UUID, allowNull: false },
        title: { type: DataTypes.STRING, allowNull: false },
        goal: { type: DataTypes.STRING, allowNull: false },
        duration: { type: DataTypes.STRING, allowNull: false },
        weeks: { type: DataTypes.INTEGER, allowNull: false },
        level: { type: DataTypes.STRING, allowNull: false },
        calories: { type: DataTypes.INTEGER, allowNull: false },
        color: { type: DataTypes.STRING, allowNull: true },
        accent: { type: DataTypes.STRING, allowNull: true },
        startDate: { type: DataTypes.DATEONLY, allowNull: false },
        currentWeek: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        currentDay: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        completedDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        totalDays: { type: DataTypes.INTEGER, allowNull: false },
        adherenceRate: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      },
      {
        sequelize,
        tableName: "programs",
        timestamps: true,
        underscored: true,
      },
    );
    return Program;
  }
}