import { UniqueConstraintError } from "sequelize";
import { CoachProfile } from "../models";
import type { UpsertCoachProfileInput } from "../schemas/coach.schemas";

export const coachProfileService = {
  async getByUserId(userId: string) {
    return CoachProfile.findOne({ where: { userId } });
  },

  /**
   * `data` is already allowlisted by `upsertCoachProfileSchema`, so `rating`
   * and `clientsCount` cannot arrive here from a request body.
   *
   * Update-then-create rather than read-then-write: `coach_profiles.user_id`
   * is unique, so two concurrent saves from the same coach would otherwise
   * both find no row and both insert. The loser of that race is caught and
   * retried as an update.
   */
  async upsert(userId: string, data: UpsertCoachProfileInput) {
    const [updated] = await CoachProfile.update(data, { where: { userId } });
    if (updated > 0) {
      return CoachProfile.findOne({ where: { userId } });
    }

    try {
      return await CoachProfile.create({ ...data, userId });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        await CoachProfile.update(data, { where: { userId } });
        return CoachProfile.findOne({ where: { userId } });
      }
      throw err;
    }
  },
};
