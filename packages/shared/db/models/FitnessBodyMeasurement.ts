import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface FitnessBodyMeasurementAttributes {
  id: string;
  userId: string;
  measuredOn: Date;
  weight: number;
  waist: number;
  chest: number;
  hips: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FitnessBodyMeasurementCreationAttributes extends Optional<
  FitnessBodyMeasurementAttributes,
  "id"
> {}

export class FitnessBodyMeasurement
  extends Model<
    FitnessBodyMeasurementAttributes,
    FitnessBodyMeasurementCreationAttributes
  >
  implements FitnessBodyMeasurementAttributes
{
  declare id: string;
  declare userId: string;
  declare measuredOn: Date;
  declare weight: number;
  declare waist: number;
  declare chest: number;
  declare hips: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof FitnessBodyMeasurement {
    FitnessBodyMeasurement.init(
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
        measuredOn: {
          type: DataTypes.DATEONLY,
          allowNull: false,
        },
        weight: {
          type: DataTypes.DECIMAL(6, 2),
          allowNull: false,
        },
        waist: {
          type: DataTypes.DECIMAL(6, 2),
          allowNull: false,
        },
        chest: {
          type: DataTypes.DECIMAL(6, 2),
          allowNull: false,
        },
        hips: {
          type: DataTypes.DECIMAL(6, 2),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "fitness_body_measurements",
        timestamps: true,
        underscored: true,
        indexes: [{ fields: ["user_id", "measured_on"], unique: true }],
      },
    );
    return FitnessBodyMeasurement;
  }
}
