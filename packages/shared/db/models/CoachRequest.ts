import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export type CoachRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed";

export interface CoachRequestAttributes {
  id: string;
  userId: string;
  coachId: string | null;
  status: CoachRequestStatus;
  message: string | null;
  respondedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CoachRequestCreationAttributes
  extends Optional<
    CoachRequestAttributes,
    "id" | "coachId" | "status" | "message" | "respondedAt"
  > {}

/**
 * One pending request per client is enforced by a partial unique index
 * (`coach_requests_user_id_pending_unique`), not by this model — see the
 * coach domain migration.
 */
export class CoachRequest
  extends Model<CoachRequestAttributes, CoachRequestCreationAttributes>
  implements CoachRequestAttributes
{
  declare id: string;
  declare userId: string;
  declare coachId: string | null;
  declare status: CoachRequestStatus;
  declare message: string | null;
  declare respondedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof CoachRequest {
    CoachRequest.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        userId: { type: DataTypes.UUID, allowNull: false },
        coachId: { type: DataTypes.UUID, allowNull: true },
        status: {
          type: DataTypes.ENUM("pending", "accepted", "rejected", "completed"),
          allowNull: false,
          defaultValue: "pending",
        },
        message: { type: DataTypes.TEXT, allowNull: true },
        respondedAt: { type: DataTypes.DATE, allowNull: true },
      },
      {
        sequelize,
        tableName: "coach_requests",
        timestamps: true,
        underscored: true,
      },
    );
    return CoachRequest;
  }
}
