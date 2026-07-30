"use strict";

/**
 * Extends the `programs` table so a single row can act as a browsable catalog
 * template (no owner) in addition to a per-user enrolled instance.
 *
 * - Adds the marketing/detail fields the browse + detail pages render.
 * - Relaxes owner-instance-only columns to be nullable so catalog rows can omit
 *   them (user_id, start_date, total_days).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    // Owner-instance-only columns become optional for catalog rows.
    await queryInterface.changeColumn("programs", "user_id", {
      type: DataTypes.UUID,
      allowNull: true,
    });
    await queryInterface.changeColumn("programs", "start_date", {
      type: DataTypes.DATEONLY,
      allowNull: true,
    });
    await queryInterface.changeColumn("programs", "total_days", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });

    // Catalog / marketing fields.
    await queryInterface.addColumn("programs", "slug", {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    });
    await queryInterface.addColumn("programs", "tagline", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "description", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "days_per_week", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "macros", {
      type: DataTypes.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "focus", {
      type: DataTypes.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "equipment", {
      type: DataTypes.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "image", {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "rating", {
      type: DataTypes.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "enrolled", {
      type: DataTypes.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "sample_week", {
      type: DataTypes.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "sample_meals", {
      type: DataTypes.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn("programs", "is_catalog", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    const { DataTypes } = Sequelize;

    await queryInterface.removeColumn("programs", "is_catalog");
    await queryInterface.removeColumn("programs", "sample_meals");
    await queryInterface.removeColumn("programs", "sample_week");
    await queryInterface.removeColumn("programs", "enrolled");
    await queryInterface.removeColumn("programs", "rating");
    await queryInterface.removeColumn("programs", "image");
    await queryInterface.removeColumn("programs", "equipment");
    await queryInterface.removeColumn("programs", "focus");
    await queryInterface.removeColumn("programs", "macros");
    await queryInterface.removeColumn("programs", "days_per_week");
    await queryInterface.removeColumn("programs", "description");
    await queryInterface.removeColumn("programs", "tagline");
    await queryInterface.removeColumn("programs", "slug");

    await queryInterface.changeColumn("programs", "total_days", {
      type: DataTypes.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn("programs", "start_date", {
      type: DataTypes.DATEONLY,
      allowNull: false,
    });
    await queryInterface.changeColumn("programs", "user_id", {
      type: DataTypes.UUID,
      allowNull: false,
    });
  },
};
