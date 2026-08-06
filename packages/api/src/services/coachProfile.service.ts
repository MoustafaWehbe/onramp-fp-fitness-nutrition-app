import { CoachProfile } from "../models";
import type { UpsertCoachProfileInput } from "../schemas/coach.schemas";

export const coachProfileService = {
  async getByUserId(userId: string) {
    return CoachProfile.findOne({ where: { userId } });
  },

  /**
   * `data` is already allowlisted by `upsertCoachProfileSchema`, so `rating`
   * and `clientsCount` cannot arrive here from a request body.
   */
  async upsert(userId: string, data: UpsertCoachProfileInput) {
    const existing = await CoachProfile.findOne({ where: { userId } });
    if (existing) return existing.update(data);
    return CoachProfile.create({ ...data, userId });
  },
};
