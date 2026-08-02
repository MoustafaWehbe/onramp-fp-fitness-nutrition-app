import { UserProfile } from "../models";

export const userProfileService = {
  async getByUserId(userId: string) {
    return UserProfile.findOne({ where: { userId } });
  },

  async upsert(userId: string, data: Omit<Parameters<typeof UserProfile.create>[0], "userId" | "completedAt">) {
    const existing = await UserProfile.findOne({ where: { userId } });
    if (existing) {
      return existing.update({ ...data, completedAt: new Date() });
    }
    return UserProfile.create({ ...data, userId, completedAt: new Date() } as any);
  },
};