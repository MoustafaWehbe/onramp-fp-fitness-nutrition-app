"use strict";

const userId = "00000000-0000-0000-0000-000000000001";

const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("fitness_body_measurements", [
      ["2026-06-01", 184.6, 35.5, 42.1, 40.2],
      ["2026-06-08", 183.8, 35.1, 42.2, 40.1],
      ["2026-06-15", 182.9, 34.8, 42.3, 39.9],
      ["2026-06-22", 181.7, 34.4, 42.4, 39.8],
    ].map(([date, weight, waist, chest, hips]) => ({
      user_id: userId,
      measured_on: date,
      weight,
      waist,
      chest,
      hips,
      created_at: now,
      updated_at: now,
    })));

    // Chat history should be created only by real assistant endpoint calls.
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("fitness_body_measurements", {
      user_id: userId,
    });
  },
};
