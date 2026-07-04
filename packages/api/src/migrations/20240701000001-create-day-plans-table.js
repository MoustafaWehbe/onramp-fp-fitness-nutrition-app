"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("day_plans", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      program_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "programs", key: "id" },
        onDelete: "CASCADE",
      },
      day_number: { type: Sequelize.INTEGER, allowNull: false },
      label: { type: Sequelize.STRING, allowNull: false },
      date: { type: Sequelize.DATEONLY, allowNull: false },
      is_rest_day: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex("day_plans", ["program_id", "date"], {
      unique: true,
      name: "day_plans_program_date_unique",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("day_plans");
  },
};