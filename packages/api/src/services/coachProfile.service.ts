import { CoachProfile } from "../models";

export const coachProfileService = {
  async getByUserId(userId: string) {
    return CoachProfile.findOne({ where: { userId } });
  },

  async upsert(userId: string, data: Omit<Parameters<typeof CoachProfile.create>[0], "userId">) {
    const existing = await CoachProfile.findOne({ where: { userId } });
    if (existing) return existing.update(data);
    return CoachProfile.create({ ...data, userId } as any);
  },
};