"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meals", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      day_plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "day_plans", key: "id" },
        onDelete: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM("breakfast", "snack", "lunch", "dinner"),
        allowNull: false,
      },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      time: { type: Sequelize.STRING, allowNull: false },
      total_calories: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      total_protein: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      total_carbs: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      total_fat: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.createTable("meal_items", {
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
      name: { type: Sequelize.STRING, allowNull: false },
      quantity: { type: Sequelize.STRING, allowNull: false },
      calories: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      protein: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      carbs: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      fat: { type: Sequelize.FLOAT, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("meal_items");
    await queryInterface.dropTable("meals");
  },
};