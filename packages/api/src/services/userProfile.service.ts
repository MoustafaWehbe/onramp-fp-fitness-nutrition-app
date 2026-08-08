import { UniqueConstraintError } from "sequelize";
import { UserProfile } from "../models";
import type { UpsertUserProfileInput } from "../schemas/userProfile.schemas";

export const userProfileService = {
  async getByUserId(userId: string) {
    return UserProfile.findOne({ where: { userId } });
  },

  /**
   * Update-then-create, mirroring coachProfile.service.ts: `user_profiles.user_id`
   * is unique, so two concurrent saves racing a read-then-write could both find
   * no row and both insert. The loser is caught and retried as an update.
   */
  async upsert(userId: string, data: UpsertUserProfileInput) {
    const [updated] = await UserProfile.update(
      { ...data, completedAt: new Date() },
      { where: { userId } },
    );
    if (updated > 0) {
      return UserProfile.findOne({ where: { userId } });
    }

    try {
      return await UserProfile.create({ ...data, userId, completedAt: new Date() });
    } catch (err) {
      if (err instanceof UniqueConstraintError) {
        await UserProfile.update(
          { ...data, completedAt: new Date() },
          { where: { userId } },
        );
        return UserProfile.findOne({ where: { userId } });
      }
      throw err;
    }
  },
};