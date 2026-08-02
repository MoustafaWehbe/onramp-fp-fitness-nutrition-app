"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Extend users.role enum to include "coach"
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'coach';`
    );

    // 2. user_profiles table
    await queryInterface.createTable("user_profiles", {
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
      age: { type: Sequelize.INTEGER, allowNull: false },
      gender: {
        type: Sequelize.ENUM("male", "female", "other"),
        allowNull: false,
      },
      height_cm: { type: Sequelize.FLOAT, allowNull: false },
      weight_kg: { type: Sequelize.FLOAT, allowNull: false },
      target_weight_kg: { type: Sequelize.FLOAT, allowNull: true },
      activity_level: {
        type: Sequelize.ENUM("sedentary", "light", "moderate", "active", "very_active"),
        allowNull: false,
      },
      goal: {
        type: Sequelize.ENUM("lose_weight", "gain_muscle", "maintain", "improve_endurance", "general_health"),
        allowNull: false,
      },
      injuries: { type: Sequelize.TEXT, allowNull: true },
      dietary_notes: { type: Sequelize.TEXT, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // 3. coach_requests table
    await queryInterface.createTable("coach_requests", {
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
      coach_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL",
      },
      status: {
        type: Sequelize.ENUM("pending", "accepted", "rejected", "completed"),
        allowNull: false,
        defaultValue: "pending",
      },
      message: { type: Sequelize.TEXT, allowNull: true },
      responded_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    // 4. Extend programs with coach ownership
    await queryInterface.addColumn("programs", "coach_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    });
    await queryInterface.addColumn("programs", "coach_request_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "coach_requests", key: "id" },
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("programs", "coach_request_id");
    await queryInterface.removeColumn("programs", "coach_id");
    await queryInterface.dropTable("coach_requests");
    await queryInterface.dropTable("user_profiles");
    // Note: Postgres doesn't support removing enum values; "coach" stays in enum_users_role on down.
  },
};