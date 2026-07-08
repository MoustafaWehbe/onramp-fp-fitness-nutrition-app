import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface FitnessPlanAttributes {
  id: string;
  userId: string;
  slug: string;
  name: string;
  focus: string;
  calorieTarget: number;
  proteinTarget: number;
  workoutTargetPerWeek: number;
  startsOn?: Date;
  endsOn?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FitnessPlanCreationAttributes extends Optional<
  FitnessPlanAttributes,
  "id" | "startsOn" | "endsOn" | "isActive"
> {}

export class FitnessPlan
  extends Model<FitnessPlanAttributes, FitnessPlanCreationAttributes>
  implements FitnessPlanAttributes
{
  declare id: string;
  declare userId: string;
  declare slug: string;
  declare name: string;
  declare focus: string;
  declare calorieTarget: number;
  declare proteinTarget: number;
  declare workoutTargetPerWeek: number;
  declare startsOn: Date | undefined;
  declare endsOn: Date | undefined;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof FitnessPlan {
    FitnessPlan.init(
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
        slug: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        focus: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        calorieTarget: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        proteinTarget: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        workoutTargetPerWeek: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        startsOn: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        endsOn: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
      },
      {
        sequelize,
        tableName: "fitness_plans",
        timestamps: true,
        underscored: true,
        indexes: [
          { fields: ["user_id", "slug"], unique: true },
          { fields: ["user_id", "is_active"] },
        ],
      },
    );
    return FitnessPlan;
  }
}
