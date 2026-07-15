"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS fitness_legacy_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        source_table TEXT NOT NULL,
        source_id UUID NULL,
        user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        program_id UUID NULL REFERENCES programs(id) ON DELETE SET NULL,
        occurred_on DATE NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );

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

      DO $$
      BEGIN
        IF to_regclass('public.fitness_plans') IS NOT NULL THEN
          INSERT INTO fitness_legacy_records (
            source_table,
            source_id,
            user_id,
            program_id,
            occurred_on,
            payload
          )
          SELECT
            'fitness_plans',
            plan.id,
            plan.user_id,
            program.id,
            plan.starts_on,
            to_jsonb(plan)
          FROM fitness_plans AS plan
          LEFT JOIN LATERAL (
            SELECT id
            FROM programs
            WHERE programs.user_id = plan.user_id
            ORDER BY programs.updated_at DESC
            LIMIT 1
          ) AS program ON TRUE
          WHERE NOT EXISTS (
            SELECT 1
            FROM fitness_legacy_records AS existing
            WHERE existing.source_table = 'fitness_plans'
              AND existing.source_id = plan.id
          );
        END IF;

        IF to_regclass('public.fitness_daily_logs') IS NOT NULL THEN
          INSERT INTO fitness_legacy_records (
            source_table,
            source_id,
            user_id,
            program_id,
            occurred_on,
            payload
          )
          SELECT
            'fitness_daily_logs',
            daily.id,
            daily.user_id,
            message_program.program_id,
            daily.log_date,
            to_jsonb(daily)
          FROM fitness_daily_logs AS daily
          LEFT JOIN LATERAL (
            SELECT program_id
            FROM fitness_legacy_records
            WHERE source_table = 'fitness_plans'
              AND source_id = daily.plan_id
            LIMIT 1
          ) AS message_program ON TRUE
          WHERE NOT EXISTS (
            SELECT 1
            FROM fitness_legacy_records AS existing
            WHERE existing.source_table = 'fitness_daily_logs'
              AND existing.source_id = daily.id
          );
        END IF;

        IF to_regclass('public.fitness_workout_logs') IS NOT NULL THEN
          INSERT INTO fitness_legacy_records (
            source_table,
            source_id,
            user_id,
            program_id,
            occurred_on,
            payload
          )
          SELECT
            'fitness_workout_logs',
            workout.id,
            workout.user_id,
            message_program.program_id,
            workout.log_date,
            to_jsonb(workout)
          FROM fitness_workout_logs AS workout
          LEFT JOIN LATERAL (
            SELECT program_id
            FROM fitness_legacy_records
            WHERE source_table = 'fitness_plans'
              AND source_id = workout.plan_id
            LIMIT 1
          ) AS message_program ON TRUE
          WHERE NOT EXISTS (
            SELECT 1
            FROM fitness_legacy_records AS existing
            WHERE existing.source_table = 'fitness_workout_logs'
              AND existing.source_id = workout.id
          );
        END IF;

        IF to_regclass('public.fitness_meal_logs') IS NOT NULL THEN
          INSERT INTO fitness_legacy_records (
            source_table,
            source_id,
            user_id,
            program_id,
            occurred_on,
            payload
          )
          SELECT
            'fitness_meal_logs',
            meal.id,
            meal.user_id,
            message_program.program_id,
            meal.log_date,
            to_jsonb(meal)
          FROM fitness_meal_logs AS meal
          LEFT JOIN LATERAL (
            SELECT program_id
            FROM fitness_legacy_records
            WHERE source_table = 'fitness_plans'
              AND source_id = meal.plan_id
            LIMIT 1
          ) AS message_program ON TRUE
          WHERE NOT EXISTS (
            SELECT 1
            FROM fitness_legacy_records AS existing
            WHERE existing.source_table = 'fitness_meal_logs'
              AND existing.source_id = meal.id
          );
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
