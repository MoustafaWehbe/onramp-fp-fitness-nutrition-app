"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn("users", "password_hash", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("users", "google_id", {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "google_id");

    await queryInterface.changeColumn("users", "password_hash", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};