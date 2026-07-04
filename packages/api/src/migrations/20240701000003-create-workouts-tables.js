"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("workouts", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      day_plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: "day_plans", key: "id" },
        onDelete: "CASCADE",
      },
      name: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false }, 
      duration: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("exercises", {
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
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      name: { type: Sequelize.STRING, allowNull: false },
      sets: { type: Sequelize.INTEGER, allowNull: false },
      reps: { type: Sequelize.STRING, allowNull: false },
      rest: { type: Sequelize.STRING, allowNull: false },
      muscle: { type: Sequelize.STRING, allowNull: false },
      notes: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("exercises");
    await queryInterface.dropTable("workouts");
  },
};