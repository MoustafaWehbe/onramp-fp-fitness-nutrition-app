"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE fitness_ai_chat_messages
      ADD COLUMN IF NOT EXISTS program_id UUID NULL REFERENCES programs(id) ON DELETE SET NULL;

      DO $$
      BEGIN
        IF to_regclass('public.fitness_plans') IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'fitness_ai_chat_messages'
              AND column_name = 'plan_id'
          )
        THEN
          UPDATE fitness_ai_chat_messages AS message
          SET program_id = program.id
          FROM fitness_plans AS plan
          JOIN LATERAL (
            SELECT id
            FROM programs
            WHERE programs.user_id = plan.user_id
            ORDER BY programs.updated_at DESC
            LIMIT 1
          ) AS program ON TRUE
          WHERE message.plan_id = plan.id
            AND message.program_id IS NULL;
        END IF;
      END $$;

      ALTER TABLE fitness_ai_chat_messages DROP COLUMN IF EXISTS plan_id;

      DROP TABLE IF EXISTS fitness_meal_logs CASCADE;
      DROP TABLE IF EXISTS fitness_workout_logs CASCADE;
      DROP TABLE IF EXISTS fitness_daily_logs CASCADE;
      DROP TABLE IF EXISTS fitness_plans CASCADE;
    `);
  },

  async down() {
    throw new Error(
      "This migration removes duplicated fitness tables in favor of shared program/log tables and cannot be safely reversed.",
    );
  },
};
