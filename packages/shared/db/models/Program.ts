import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface ProgramMacros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface ProgramSampleWorkoutDay {
  day: string;
  title: string;
  focus: string;
  durationMin: number;
  rest: boolean;
}

export interface ProgramSampleMeal {
  name: string;
  items: string;
  calories: number;
}

export type ProgramStatus = "draft" | "published";

export interface ProgramAttributes {
  id: string;
  userId: string | null;
  coachId: string | null;
  coachRequestId: string | null;
  status: ProgramStatus;
  title: string;
  goal: string;
  duration: string;
  weeks: number;
  level: string;
  calories: number;
  color: string | null;
  accent: string | null;
  startDate: string | null;
  currentWeek: number;
  currentDay: number;
  completedDays: number;
  totalDays: number | null;
  adherenceRate: number;
  // Catalog / marketing fields (populated for browsable template rows).
  isCatalog: boolean;
  slug: string | null;
  tagline: string | null;
  description: string | null;
  daysPerWeek: number | null;
  macros: ProgramMacros | null;
  focus: string[] | null;
  equipment: string | null;
  image: string | null;
  rating: number | null;
  enrolled: number | null;
  sampleWeek: ProgramSampleWorkoutDay[] | null;
  sampleMeals: ProgramSampleMeal[] | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProgramCreationAttributes
  extends Optional<
    ProgramAttributes,
    | "id"
    | "userId"
    | "coachId"
    | "coachRequestId"
    | "status"
    | "startDate"
    | "totalDays"
    | "currentWeek"
    | "currentDay"
    | "completedDays"
    | "adherenceRate"
    | "isCatalog"
    | "slug"
    | "tagline"
    | "description"
    | "daysPerWeek"
    | "macros"
    | "focus"
    | "equipment"
    | "image"
    | "rating"
    | "enrolled"
    | "sampleWeek"
    | "sampleMeals"
    | "color"
    | "accent"
  > {}

export class Program
  extends Model<ProgramAttributes, ProgramCreationAttributes>
  implements ProgramAttributes
{
  declare id: string;
  declare userId: string | null;
  declare coachId: string | null;
  declare coachRequestId: string | null;
  declare status: ProgramStatus;
  declare title: string;
  declare goal: string;
  declare duration: string;
  declare weeks: number;
  declare level: string;
  declare calories: number;
  declare color: string | null;
  declare accent: string | null;
  declare startDate: string | null;
  declare currentWeek: number;
  declare currentDay: number;
  declare completedDays: number;
  declare totalDays: number | null;
  declare adherenceRate: number;
  declare isCatalog: boolean;
  declare slug: string | null;
  declare tagline: string | null;
  declare description: string | null;
  declare daysPerWeek: number | null;
  declare macros: ProgramMacros | null;
  declare focus: string[] | null;
  declare equipment: string | null;
  declare image: string | null;
  declare rating: number | null;
  declare enrolled: number | null;
  declare sampleWeek: ProgramSampleWorkoutDay[] | null;
  declare sampleMeals: ProgramSampleMeal[] | null;
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
        userId: { type: DataTypes.UUID, allowNull: true },
        coachId: { type: DataTypes.UUID, allowNull: true },
        coachRequestId: { type: DataTypes.UUID, allowNull: true },
        status: {
          type: DataTypes.ENUM("draft", "published"),
          allowNull: false,
          defaultValue: "draft",
        },
        title: { type: DataTypes.STRING, allowNull: false },
        goal: { type: DataTypes.STRING, allowNull: false },
        duration: { type: DataTypes.STRING, allowNull: false },
        weeks: { type: DataTypes.INTEGER, allowNull: false },
        level: { type: DataTypes.STRING, allowNull: false },
        calories: { type: DataTypes.INTEGER, allowNull: false },
        color: { type: DataTypes.STRING, allowNull: true },
        accent: { type: DataTypes.STRING, allowNull: true },
        startDate: { type: DataTypes.DATEONLY, allowNull: true },
        currentWeek: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        currentDay: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
        completedDays: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        totalDays: { type: DataTypes.INTEGER, allowNull: true },
        adherenceRate: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        isCatalog: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        slug: { type: DataTypes.STRING, allowNull: true, unique: true },
        tagline: { type: DataTypes.STRING, allowNull: true },
        description: { type: DataTypes.TEXT, allowNull: true },
        daysPerWeek: { type: DataTypes.INTEGER, allowNull: true },
        macros: { type: DataTypes.JSONB, allowNull: true },
        focus: { type: DataTypes.JSONB, allowNull: true },
        equipment: { type: DataTypes.STRING, allowNull: true },
        image: { type: DataTypes.TEXT, allowNull: true },
        rating: { type: DataTypes.FLOAT, allowNull: true },
        enrolled: { type: DataTypes.INTEGER, allowNull: true },
        sampleWeek: { type: DataTypes.JSONB, allowNull: true },
        sampleMeals: { type: DataTypes.JSONB, allowNull: true },
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
