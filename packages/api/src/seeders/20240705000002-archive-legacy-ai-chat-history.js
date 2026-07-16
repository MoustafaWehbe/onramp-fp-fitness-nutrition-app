"use strict";

const userId = "00000000-0000-0000-0000-000000000001";

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      INSERT INTO fitness_legacy_records (
        id,
        source_table,
        source_id,
        user_id,
        program_id,
        occurred_on,
        payload,
        created_at
      )
      SELECT
        gen_random_uuid(),
        'fitness_ai_chat_messages_legacy_demo',
        id,
        user_id,
        program_id,
        created_at::date,
        jsonb_build_object(
          'role', role,
          'content', content,
          'created_at', created_at,
          'updated_at', updated_at
        ),
        now()
      FROM fitness_ai_chat_messages
      WHERE user_id = :userId
        AND NOT EXISTS (
          SELECT 1
          FROM fitness_legacy_records legacy
          WHERE legacy.source_table = 'fitness_ai_chat_messages_legacy_demo'
            AND legacy.source_id = fitness_ai_chat_messages.id
        );
    `, { replacements: { userId } });

    await queryInterface.sequelize.query(
      "DELETE FROM fitness_ai_chat_messages WHERE user_id = :userId;",
      { replacements: { userId } },
    );
  },

  async down() {
    // Intentionally not reversible: archived legacy demo chat was stale and not provider-verifiable.
  },
};
