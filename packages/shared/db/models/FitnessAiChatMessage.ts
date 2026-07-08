import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export type FitnessAiChatRole = "user" | "assistant";

export interface FitnessAiChatMessageAttributes {
  id: string;
  userId: string;
  planId?: string;
  role: FitnessAiChatRole;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FitnessAiChatMessageCreationAttributes extends Optional<
  FitnessAiChatMessageAttributes,
  "id" | "planId"
> {}

export class FitnessAiChatMessage
  extends Model<
    FitnessAiChatMessageAttributes,
    FitnessAiChatMessageCreationAttributes
  >
  implements FitnessAiChatMessageAttributes
{
  declare id: string;
  declare userId: string;
  declare planId: string | undefined;
  declare role: FitnessAiChatRole;
  declare content: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof FitnessAiChatMessage {
    FitnessAiChatMessage.init(
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
        planId: {
          type: DataTypes.UUID,
          allowNull: true,
          references: { model: "fitness_plans", key: "id" },
          onDelete: "SET NULL",
        },
        role: {
          type: DataTypes.ENUM("user", "assistant"),
          allowNull: false,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "fitness_ai_chat_messages",
        timestamps: true,
        underscored: true,
        indexes: [{ fields: ["user_id", "created_at"] }],
      },
    );
    return FitnessAiChatMessage;
  }
}
