import { UniqueConstraintError } from "sequelize";
import { CoachRequest, User, UserProfile } from "../models";
import { createError } from "../middleware/error-handler";

/** Neither side needs the other's email to work through a request. */
const PUBLIC_USER_FIELDS = ["id", "name"] as const;

export const coachRequestService = {
  async create(userId: string, coachId: string, message?: string) {
    const coach = await User.findOne({ where: { id: coachId, role: "coach" } });
    if (!coach) {
      throw createError("Selected coach not found.", 404);
    }

    try {
      return await CoachRequest.create({
        userId,
        coachId,
        message: message ?? null,
      });
    } catch (err) {
      // A read-then-insert cannot hold "one pending request per client": two
      // concurrent calls both see no pending row. The partial unique index
      // does, and surfaces here.
      if (err instanceof UniqueConstraintError) {
        throw createError("You already have a pending coach request.", 409);
      }
      throw err;
    }
  },

  /** Requests addressed to this coach only. */
  async listPending(coachId: string) {
    return CoachRequest.findAll({
      where: { status: "pending", coachId },
      include: [
        {
          model: User,
          as: "user",
          attributes: [...PUBLIC_USER_FIELDS],
          include: [{ model: UserProfile, as: "profile" }],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
  },

  async accept(coachRequestId: string, coachId: string) {
    const request = await this.findOwnPending(coachRequestId, coachId);
    return request.update({ status: "accepted", respondedAt: new Date() });
  },

  async decline(coachRequestId: string, coachId: string) {
    const request = await this.findOwnPending(coachRequestId, coachId);
    return request.update({ status: "rejected", respondedAt: new Date() });
  },

  async getForUser(userId: string) {
    return CoachRequest.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        { model: User, as: "coach", attributes: [...PUBLIC_USER_FIELDS] },
      ],
    });
  },

  /**
   * A coach must never reach a request that was not addressed to them. Both
   * transitions go through here so neither can drift.
   */
  async findOwnPending(coachRequestId: string, coachId: string) {
    const request = await CoachRequest.findByPk(coachRequestId);
    if (!request || request.coachId !== coachId) {
      throw createError("Coach request not found.", 404);
    }
    if (request.status !== "pending") {
      throw createError("This request has already been handled.", 409);
    }
    return request;
  },
};
