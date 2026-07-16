"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM fitness_ai_chat_messages
      WHERE role = 'assistant'
        AND (
          content = 'I am ready to coach from your active program and saved PostgreSQL logs. Ask about meals, workouts, adherence, or recovery.'
          OR content LIKE 'I am ready to coach from your Lean Strength 8-Week Plan%'
        );
    `);
  },

  async down() {
    // Intentionally not reversible: seeded assistant welcome messages are not real provider output.
  },
};
