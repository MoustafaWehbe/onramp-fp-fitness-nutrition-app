"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("coach_profiles", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      title: { type: Sequelize.STRING, allowNull: true },
      bio: { type: Sequelize.TEXT, allowNull: true },
      specialties: { type: Sequelize.JSONB, allowNull: true },
      years_experience: { type: Sequelize.INTEGER, allowNull: true },
      certifications: { type: Sequelize.JSONB, allowNull: true },
      rating: { type: Sequelize.FLOAT, allowNull: true },
      clients_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      avatar_url: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("coach_profiles");
  },
};