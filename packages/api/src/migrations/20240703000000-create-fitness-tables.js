"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("fitness_body_measurements", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      measured_on: { type: Sequelize.DATEONLY, allowNull: false },
      weight: { type: Sequelize.DECIMAL(6, 2), allowNull: false },
      waist: { type: Sequelize.DECIMAL(6, 2), allowNull: false },
      chest: { type: Sequelize.DECIMAL(6, 2), allowNull: false },
      hips: { type: Sequelize.DECIMAL(6, 2), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "fitness_body_measurements",
      ["user_id", "measured_on"],
      { unique: true, name: "fitness_body_measurements_user_date_unique" },
    );

    await queryInterface.createTable("fitness_ai_chat_messages", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal("gen_random_uuid()"),
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      program_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "programs", key: "id" },
        onDelete: "SET NULL",
      },
      role: {
        type: Sequelize.ENUM("user", "assistant"),
        allowNull: false,
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "fitness_ai_chat_messages",
      ["user_id", "created_at"],
      { name: "fitness_ai_chat_messages_user_created_idx" },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("fitness_ai_chat_messages");
    await queryInterface.dropTable("fitness_body_measurements");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_fitness_ai_chat_messages_role";',
    );
  },
};
