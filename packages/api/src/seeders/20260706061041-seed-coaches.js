"use strict";
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt"); // match auth.controller.ts exactly

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash("Coach123!", 10);
    const now = new Date();

    await queryInterface.bulkInsert("users", [
      {
        id: uuidv4(),
        email: "coach.sara@fitcoach.ai",
        password_hash: passwordHash,
        google_id: null,
        name: "Sara Haddad",
        role: "coach",
        email_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        email: "coach.omar@fitcoach.ai",
        password_hash: passwordHash,
        google_id: null,
        name: "Omar Fares",
        role: "coach",
        email_verified: true,
        created_at: now,
        updated_at: now,
      },
      {
        id: uuidv4(),
        email: "coach.lina@fitcoach.ai",
        password_hash: passwordHash,
        google_id: null,
        name: "Lina Youssef",
        role: "coach",
        email_verified: true,
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("users", {
      email: [
        "coach.sara@fitcoach.ai",
        "coach.omar@fitcoach.ai",
        "coach.lina@fitcoach.ai",
      ],
    });
  },
};