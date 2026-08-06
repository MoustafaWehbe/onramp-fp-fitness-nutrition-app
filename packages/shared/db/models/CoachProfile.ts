import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";
import type { Gender } from "./UserProfile";

export interface CoachProfileAttributes {
  id: string;
  userId: string;
  title: string | null;
  bio: string | null;
  gender: Gender | null;
  birthDate: string | null;
  specialties: string[] | null;
  yearsExperience: number | null;
  certifications: string[] | null;
  rating: number | null;
  clientsCount: number;
  avatarUrl: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CoachProfileCreationAttributes
  extends Optional<
    CoachProfileAttributes,
    | "id"
    | "title"
    | "bio"
    | "gender"
    | "birthDate"
    | "specialties"
    | "yearsExperience"
    | "certifications"
    | "rating"
    | "clientsCount"
    | "avatarUrl"
  > {}

/**
 * `rating` and `clientsCount` are derived, not coach-editable. The write path
 * allowlists the editable fields in coachProfile.schemas.ts.
 */
export class CoachProfile
  extends Model<CoachProfileAttributes, CoachProfileCreationAttributes>
  implements CoachProfileAttributes
{
  declare id: string;
  declare userId: string;
  declare title: string | null;
  declare bio: string | null;
  declare gender: Gender | null;
  declare birthDate: string | null;
  declare specialties: string[] | null;
  declare yearsExperience: number | null;
  declare certifications: string[] | null;
  declare rating: number | null;
  declare clientsCount: number;
  declare avatarUrl: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof CoachProfile {
    CoachProfile.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: { type: DataTypes.UUID, allowNull: false, unique: true },
        title: { type: DataTypes.STRING, allowNull: true },
        bio: { type: DataTypes.TEXT, allowNull: true },
        gender: { type: DataTypes.ENUM("male", "female"), allowNull: true },
        birthDate: { type: DataTypes.DATEONLY, allowNull: true },
        specialties: { type: DataTypes.JSONB, allowNull: true },
        yearsExperience: { type: DataTypes.INTEGER, allowNull: true },
        certifications: { type: DataTypes.JSONB, allowNull: true },
        rating: { type: DataTypes.FLOAT, allowNull: true },
        clientsCount: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        avatarUrl: { type: DataTypes.TEXT, allowNull: true },
      },
      {
        sequelize,
        tableName: "coach_profiles",
        timestamps: true,
        underscored: true,
      },
    );
    return CoachProfile;
  }
}
