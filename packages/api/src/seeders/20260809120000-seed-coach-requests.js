"use strict";

const bcrypt = require("bcryptjs");

const SARA_ID = "00000000-0000-0000-0000-0000000000c1";

/**
 * Demo clients who have already asked Sara to coach them, so the coach
 * Requests page has something to act on without registering an account and
 * sending a request by hand first.
 *
 * Fixed ids, following 20260806120100-seed-coaches.js.
 */
const CLIENTS = [
  {
    id: "00000000-0000-0000-0000-0000000000d1",
    profileId: "00000000-0000-0000-0000-0000000000f1",
    requestId: "00000000-0000-0000-0000-0000000000e1",
    email: "client.nour@fitcoach.ai",
    name: "Nour Khalil",
    message:
      "I want to lose weight before my wedding in October. I have a desk job and can train 4 days a week.",
    profile: {
      age: 29,
      gender: "female",
      height_cm: 165,
      weight_kg: 78,
      target_weight_kg: 65,
      activity_level: "light",
      goal: "lose_weight",
      injuries: "Lower back pain when deadlifting",
      dietary_notes: "Vegetarian, no eggs",
    },
  },
  {
    id: "00000000-0000-0000-0000-0000000000d2",
    profileId: "00000000-0000-0000-0000-0000000000f2",
    requestId: "00000000-0000-0000-0000-0000000000e2",
    email: "client.karim@fitcoach.ai",
    name: "Karim Nassar",
    message:
      "Looking to put on muscle. I have been lifting for a year but stopped progressing.",
    profile: {
      age: 24,
      gender: "male",
      height_cm: 180,
      weight_kg: 70,
      target_weight_kg: 80,
      activity_level: "active",
      goal: "gain_muscle",
      injuries: null,
      dietary_notes: "Lactose intolerant",
    },
  },
];

module.exports = {
  CLIENTS,

  /** @type {import('sequelize-cli').Migration} */
  async up(queryInterface) {
    // Same guard as the coach seeder: an unset NODE_ENV on a deployed container
    // must not fall through to a known password.
    const isDevelopment = process.env.NODE_ENV === "development";
    const password = process.env.SEED_CLIENT_PASSWORD;

    if (!isDevelopment && !password) {
      throw new Error(
        "Refusing to seed demo clients: set NODE_ENV=development, or provide SEED_CLIENT_PASSWORD.",
      );
    }

    const passwordHash = await bcrypt.hash(password ?? "Client123!", 12);
    const now = new Date();

    await queryInterface.bulkInsert(
      "users",
      CLIENTS.map((client) => ({
        id: client.id,
        email: client.email,
        password_hash: passwordHash,
        google_id: null,
        name: client.name,
        role: "user",
        email_verified: true,
        created_at: now,
        updated_at: now,
      })),
      { ignoreDuplicates: true },
    );

    await queryInterface.bulkInsert(
      "user_profiles",
      CLIENTS.map((client) => ({
        id: client.profileId,
        user_id: client.id,
        ...client.profile,
        completed_at: now,
        created_at: now,
        updated_at: now,
      })),
      { ignoreDuplicates: true },
    );

    await queryInterface.bulkInsert(
      "coach_requests",
      CLIENTS.map((client) => ({
        id: client.requestId,
        user_id: client.id,
        coach_id: SARA_ID,
        status: "pending",
        message: client.message,
        responded_at: null,
        created_at: now,
        updated_at: now,
      })),
      { ignoreDuplicates: true },
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("coach_requests", {
      id: CLIENTS.map((client) => client.requestId),
    });
    await queryInterface.bulkDelete("users", {
      id: CLIENTS.map((client) => client.id),
    });
  },
};
