import { Model, DataTypes, type Sequelize, type Optional } from "sequelize";

export interface ExerciseAttributes {
  id: string;
  workoutId: string;
  sortOrder: number;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  muscle: string;
  notes: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExerciseCreationAttributes
  extends Optional<ExerciseAttributes, "id" | "sortOrder" | "notes"> {}

export class Exercise
  extends Model<ExerciseAttributes, ExerciseCreationAttributes>
  implements ExerciseAttributes
{
  declare id: string;
  declare workoutId: string;
  declare sortOrder: number;
  declare name: string;
  declare sets: number;
  declare reps: string;
  declare rest: string;
  declare muscle: string;
  declare notes: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  static initModel(sequelize: Sequelize): typeof Exercise {
    Exercise.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        workoutId: { type: DataTypes.UUID, allowNull: false },
        sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        name: { type: DataTypes.STRING, allowNull: false },
        sets: { type: DataTypes.INTEGER, allowNull: false },
        reps: { type: DataTypes.STRING, allowNull: false },
        rest: { type: DataTypes.STRING, allowNull: false },
        muscle: { type: DataTypes.STRING, allowNull: false },
        notes: { type: DataTypes.STRING, allowNull: true },
      },
      {
        sequelize,
        tableName: "exercises",
        timestamps: true,
        underscored: true,
      },
    );
    return Exercise;
  }
}