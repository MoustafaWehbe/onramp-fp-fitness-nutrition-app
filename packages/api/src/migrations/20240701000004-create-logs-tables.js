"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meal_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      meal_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "meals", key: "id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("pending", "followed", "modified", "skipped"),
        allowNull: false,
        defaultValue: "pending",
      },
      note: { type: Sequelize.TEXT, allowNull: true },
      actual_calories: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("meal_logs", ["meal_id", "user_id"], {
      unique: true,
      name: "meal_logs_meal_user_unique",
    });

    await queryInterface.createTable("workout_logs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      workout_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "workouts", key: "id" },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("pending", "completed", "skipped", "modified"),
        allowNull: false,
        defaultValue: "pending",
      },
      note: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("workout_logs", ["workout_id", "user_id"], {
      unique: true,
      name: "workout_logs_workout_user_unique",
    });

    await queryInterface.createTable("workout_log_exercises", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      workout_log_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "workout_logs", key: "id" },
        onDelete: "CASCADE",
      },
      exercise_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "exercises", key: "id" },
        onDelete: "CASCADE",
      },
      completed: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex(
      "workout_log_exercises",
      ["workout_log_id", "exercise_id"],
      { unique: true, name: "wle_log_exercise_unique" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("workout_log_exercises");
    await queryInterface.dropTable("workout_logs");
    await queryInterface.dropTable("meal_logs");
  },
};