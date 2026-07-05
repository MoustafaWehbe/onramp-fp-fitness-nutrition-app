import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface WorkoutAttributes {
  id: string;
  dayPlanId: string;
  name: string;
  type: string;
  duration: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WorkoutCreationAttributes extends Optional<WorkoutAttributes, "id"> {}

export class Workout
  extends Model<WorkoutAttributes, WorkoutCreationAttributes>
  implements WorkoutAttributes
{
  declare id: string;
  declare dayPlanId: string;
  declare name: string;
  declare type: string;
  declare duration: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Workout {
    Workout.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        dayPlanId: { type: DataTypes.UUID, allowNull: false, unique: true },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
        duration: { type: DataTypes.STRING, allowNull: false },
      },
      {
        sequelize,
        tableName: "workouts",
        timestamps: true,
        underscored: true,
      },
    );
    return Workout;
  }
}