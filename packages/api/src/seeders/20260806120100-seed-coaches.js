"use strict";

const bcrypt = require("bcryptjs");

/**
 * Demo coach accounts.
 *
 * Fixed ids, following 20240101000000-admin-user.js. Deterministic ids make the
 * seeder idempotent and let the profile seeder link rows without querying back.
 */
const COACHES = [
  {
    id: "00000000-0000-0000-0000-0000000000c1",
    email: "coach.sara@fitcoach.ai",
    name: "Sara Haddad",
  },
  {
    id: "00000000-0000-0000-0000-0000000000c2",
    email: "coach.omar@fitcoach.ai",
    name: "Omar Fares",
  },
  {
    id: "00000000-0000-0000-0000-0000000000c3",
    email: "coach.lina@fitcoach.ai",
    name: "Lina Youssef",
  },
];

module.exports = {
  COACHES,

  /** @type {import('sequelize-cli').Migration} */
  async up(queryInterface) {
    // These are sign-in ready accounts sharing one password. Outside local
    // development the password must be supplied explicitly, so a stray
    // `db:seed:all` cannot hand a coach login to anyone who reads the repo.
    const isDevelopment =
      (process.env.NODE_ENV ?? "development") === "development";
    const password = process.env.SEED_COACH_PASSWORD;

    if (!isDevelopment && !password) {
      throw new Error(
        "Refusing to seed demo coaches without SEED_COACH_PASSWORD outside development.",
      );
    }

    const passwordHash = await bcrypt.hash(password ?? "Coach123!", 12);
    const now = new Date();

    await queryInterface.bulkInsert(
      "users",
      COACHES.map((coach) => ({
        id: coach.id,
        email: coach.email,
        password_hash: passwordHash,
        google_id: null,
        name: coach.name,
        role: "coach",
        email_verified: true,
        created_at: now,
        updated_at: now,
      })),
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      id: COACHES.map((coach) => coach.id),
    });
  },
};
