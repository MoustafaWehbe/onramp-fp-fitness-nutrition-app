import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type FitnessGoal = "lose_weight" | "gain_muscle" | "maintain" | "improve_endurance" | "general_health";

export interface UserProfileAttributes {
  id: string;
  userId: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  targetWeightKg: number | null;
  activityLevel: ActivityLevel;
  goal: FitnessGoal;
  injuries: string | null;
  dietaryNotes: string | null;
  completedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfileCreationAttributes
  extends Optional<UserProfileAttributes, "id" | "targetWeightKg" | "injuries" | "dietaryNotes" | "completedAt"> {}

export class UserProfile
  extends Model<UserProfileAttributes, UserProfileCreationAttributes>
  implements UserProfileAttributes
{
  declare id: string;
  declare userId: string;
  declare age: number;
  declare gender: Gender;
  declare heightCm: number;
  declare weightKg: number;
  declare targetWeightKg: number | null;
  declare activityLevel: ActivityLevel;
  declare goal: FitnessGoal;
  declare injuries: string | null;
  declare dietaryNotes: string | null;
  declare completedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof UserProfile {
    UserProfile.init(
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        userId: { type: DataTypes.UUID, allowNull: false, unique: true },
        age: { type: DataTypes.INTEGER, allowNull: false },
        gender: { type: DataTypes.ENUM("male", "female", "other"), allowNull: false },
        heightCm: { type: DataTypes.FLOAT, allowNull: false },
        weightKg: { type: DataTypes.FLOAT, allowNull: false },
        targetWeightKg: { type: DataTypes.FLOAT, allowNull: true },
        activityLevel: {
          type: DataTypes.ENUM("sedentary", "light", "moderate", "active", "very_active"),
          allowNull: false,
        },
        goal: {
          type: DataTypes.ENUM("lose_weight", "gain_muscle", "maintain", "improve_endurance", "general_health"),
          allowNull: false,
        },
        injuries: { type: DataTypes.TEXT, allowNull: true },
        dietaryNotes: { type: DataTypes.TEXT, allowNull: true },
        completedAt: { type: DataTypes.DATE, allowNull: true },
      },
      { sequelize, tableName: "user_profiles", timestamps: true, underscored: true },
    );
    return UserProfile;
  }
}