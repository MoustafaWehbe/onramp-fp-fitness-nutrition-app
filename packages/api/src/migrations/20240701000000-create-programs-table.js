"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("programs", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      title: { type: Sequelize.STRING, allowNull: false },
      goal: { type: Sequelize.STRING, allowNull: false },
      duration: { type: Sequelize.STRING, allowNull: false },
      weeks: { type: Sequelize.INTEGER, allowNull: false },
      level: { type: Sequelize.STRING, allowNull: false },
      calories: { type: Sequelize.INTEGER, allowNull: false },
      color: { type: Sequelize.STRING, allowNull: true },
      accent: { type: Sequelize.STRING, allowNull: true },
      start_date: { type: Sequelize.DATEONLY, allowNull: false },
      current_week: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      current_day: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      completed_days: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      total_days: { type: Sequelize.INTEGER, allowNull: false },
      adherence_rate: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("programs");
  },
};