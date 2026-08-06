import { CoachRequest, User, UserProfile } from "../models";

export const coachRequestService = {
  async create(userId: string, coachId: string, message?: string) {
    const existingPending = await CoachRequest.findOne({
      where: { userId, status: "pending" },
    });
    if (existingPending) {
      throw new Error("You already have a pending coach request.");
    }

    const coach = await User.findOne({ where: { id: coachId, role: "coach" } });
    if (!coach) {
      throw new Error("Selected coach not found.");
    }

    return CoachRequest.create({ userId, coachId, message: message ?? null });
  },

  async listPending(coachId: string) {
  return CoachRequest.findAll({
    where: { status: "pending", coachId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
        include: [{ model: UserProfile, as: "profile" }],
      },
    ],
    order: [["createdAt", "ASC"]],
  });
},

  async accept(coachRequestId: string, coachId: string) {
    const request = await CoachRequest.findByPk(coachRequestId);
    if (!request) throw new Error("Coach request not found");
    if (request.coachId !== coachId) throw new Error("This request wasn't sent to you");
    if (request.status !== "pending") throw new Error("Request already handled");
    return request.update({ status: "accepted", respondedAt: new Date() });
  },

  async getForUser(userId: string) {
    return CoachRequest.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [{ model: User, as: "coach", attributes: ["id", "name", "email"] }],
    });
  },
};