"use strict";

/**
 * The coach domain, in one migration.
 *
 * Replaces the pair that would otherwise both add `programs.coach_id` and fail
 * on whichever ran second. See docs/coach-side-plan.md for the reconciliation.
 *
 * `day_plans` is untouched: the client plan view keys off real dates, so a coach
 * program carries a start_date and each day derives its date from it.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_users_role" ADD VALUE IF NOT EXISTS 'coach';`,
    );

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
      gender: { type: Sequelize.ENUM("male", "female"), allowNull: false },
      height_cm: { type: Sequelize.FLOAT, allowNull: false },
      weight_kg: { type: Sequelize.FLOAT, allowNull: false },
      target_weight_kg: { type: Sequelize.FLOAT, allowNull: true },
      activity_level: {
        type: Sequelize.ENUM(
          "sedentary",
          "light",
          "moderate",
          "active",
          "very_active",
        ),
        allowNull: false,
      },
      goal: {
        type: Sequelize.ENUM(
          "lose_weight",
          "gain_muscle",
          "maintain",
          "improve_endurance",
          "general_health",
        ),
        allowNull: false,
      },
      injuries: { type: Sequelize.TEXT, allowNull: true },
      dietary_notes: { type: Sequelize.TEXT, allowNull: true },
      completed_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

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
      gender: { type: Sequelize.ENUM("male", "female"), allowNull: true },
      // Stored instead of an `age` integer so the discovery listing cannot
      // go stale as coaches get older.
      birth_date: { type: Sequelize.DATEONLY, allowNull: true },
      specialties: { type: Sequelize.JSONB, allowNull: true },
      years_experience: { type: Sequelize.INTEGER, allowNull: true },
      certifications: { type: Sequelize.JSONB, allowNull: true },
      rating: { type: Sequelize.FLOAT, allowNull: true },
      clients_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      avatar_url: { type: Sequelize.TEXT, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

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
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    await queryInterface.addIndex("coach_requests", ["coach_id", "status"], {
      name: "coach_requests_coach_id_status",
    });

    // "One pending request per client" cannot be held by a read-then-insert in
    // the service: two concurrent calls both see no pending row. The database
    // holds it instead, and the service maps the violation back to a 409.
    await queryInterface.addIndex("coach_requests", ["user_id"], {
      name: "coach_requests_user_id_pending_unique",
      unique: true,
      where: { status: "pending" },
    });

    await queryInterface.addColumn("programs", "coach_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "users", key: "id" },
      onDelete: "SET NULL",
    });
    await queryInterface.addIndex("programs", ["coach_id"], {
      name: "programs_coach_id",
    });

    await queryInterface.addColumn("programs", "coach_request_id", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "coach_requests", key: "id" },
      onDelete: "SET NULL",
    });

    await queryInterface.addColumn("programs", "status", {
      type: Sequelize.ENUM("draft", "published"),
      allowNull: false,
      defaultValue: "draft",
    });
    // Existing catalog and self-serve programs are already visible to clients.
    // Defaulting them to `draft` would hide them.
    await queryInterface.sequelize.query(
      `UPDATE "programs" SET "status" = 'published';`,
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("programs", "status");
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_programs_status";`,
    );

    await queryInterface.removeColumn("programs", "coach_request_id");
    await queryInterface.removeIndex("programs", "programs_coach_id");
    await queryInterface.removeColumn("programs", "coach_id");

    await queryInterface.dropTable("coach_requests");
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_coach_requests_status";`,
    );

    await queryInterface.dropTable("coach_profiles");
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_coach_profiles_gender";`,
    );

    await queryInterface.dropTable("user_profiles");
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_user_profiles_gender";`,
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_user_profiles_activity_level";`,
    );
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS "enum_user_profiles_goal";`,
    );

    // The `coach` role stays. Postgres cannot drop a single enum value without
    // recreating the type.
  },
};
