"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("fitness_plans", {
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
      slug: { type: Sequelize.STRING(120), allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: false },
      focus: { type: Sequelize.TEXT, allowNull: false },
      calorie_target: { type: Sequelize.INTEGER, allowNull: false },
      protein_target: { type: Sequelize.INTEGER, allowNull: false },
      workout_target_per_week: { type: Sequelize.INTEGER, allowNull: false },
      starts_on: { type: Sequelize.DATEONLY, allowNull: true },
      ends_on: { type: Sequelize.DATEONLY, allowNull: true },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("fitness_plans", ["user_id", "slug"], {
      unique: true,
      name: "fitness_plans_user_slug_unique",
    });
    await queryInterface.addIndex("fitness_plans", ["user_id", "is_active"], {
      name: "fitness_plans_user_active_idx",
    });

    await queryInterface.createTable("fitness_daily_logs", {
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
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fitness_plans", key: "id" },
        onDelete: "CASCADE",
      },
      log_date: { type: Sequelize.DATEONLY, allowNull: false },
      calories: { type: Sequelize.INTEGER, allowNull: false },
      protein: { type: Sequelize.INTEGER, allowNull: false },
      carbs: { type: Sequelize.INTEGER, allowNull: false },
      fat: { type: Sequelize.INTEGER, allowNull: false },
      note: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("fitness_daily_logs", ["user_id", "log_date"], {
      unique: true,
      name: "fitness_daily_logs_user_date_unique",
    });

    await queryInterface.createTable("fitness_workout_logs", {
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
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fitness_plans", key: "id" },
        onDelete: "CASCADE",
      },
      log_date: { type: Sequelize.DATEONLY, allowNull: false },
      workout_name: { type: Sequelize.STRING(255), allowNull: false },
      completed: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      duration_minutes: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("fitness_workout_logs", ["user_id", "log_date"], {
      name: "fitness_workout_logs_user_date_idx",
    });

    await queryInterface.createTable("fitness_meal_logs", {
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
      plan_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: "fitness_plans", key: "id" },
        onDelete: "CASCADE",
      },
      log_date: { type: Sequelize.DATEONLY, allowNull: false },
      meal_type: { type: Sequelize.STRING(80), allowNull: false },
      calories: { type: Sequelize.INTEGER, allowNull: false },
      protein: { type: Sequelize.INTEGER, allowNull: false },
      carbs: { type: Sequelize.INTEGER, allowNull: false },
      fat: { type: Sequelize.INTEGER, allowNull: false },
      note: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex(
      "fitness_meal_logs",
      ["user_id", "log_date", "meal_type"],
      { name: "fitness_meal_logs_user_date_type_idx" },
    );

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
      plan_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: "fitness_plans", key: "id" },
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
    await queryInterface.dropTable("fitness_meal_logs");
    await queryInterface.dropTable("fitness_workout_logs");
    await queryInterface.dropTable("fitness_daily_logs");
    await queryInterface.dropTable("fitness_plans");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_fitness_ai_chat_messages_role";',
    );
  },
};
