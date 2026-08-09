import { UniqueConstraintError } from "sequelize";
import { CoachRequest, Program, User, UserProfile } from "../models";
import { createError } from "../middleware/error-handler";
import type { CoachRequestStatus } from "@starter-kit/shared";

/** Neither side needs the other's email to work through a request. */
const PUBLIC_USER_FIELDS = ["id", "name"] as const;

/**
 * What a coach needs to judge a request. Listed explicitly so a column added
 * to user_profiles later is not exposed here by default.
 */
const REVIEW_PROFILE_FIELDS = [
  "age",
  "gender",
  "heightCm",
  "weightKg",
  "targetWeightKg",
  "activityLevel",
  "goal",
  "injuries",
  "dietaryNotes",
] as const;

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
          include: [
            {
              model: UserProfile,
              as: "profile",
              attributes: [...REVIEW_PROFILE_FIELDS],
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
    });
  },

  /** Accepted clients, so the coach can pick who to build a program for. */
  listAccepted: async (coachId: string) =>
    CoachRequest.findAll({
      where: { status: "accepted", coachId },
      include: [
        {
          model: User,
          as: "user",
          attributes: [...PUBLIC_USER_FIELDS],
          include: [
            {
              model: UserProfile,
              as: "profile",
              attributes: [...REVIEW_PROFILE_FIELDS],
            },
          ],
        },
        { model: Program, as: "program", attributes: ["id", "title", "status"] },
      ],
      order: [["respondedAt", "DESC"]],
    }),

  async accept(coachRequestId: string, coachId: string) {
    return this.resolve(coachRequestId, coachId, "accepted");
  },

  async decline(coachRequestId: string, coachId: string) {
    return this.resolve(coachRequestId, coachId, "rejected");
  },

  /**
   * One conditional update carries both the ownership check and the
   * pending-only check, so two concurrent handlers cannot each read `pending`
   * and then write a different terminal status. A miss is diagnosed
   * afterwards, purely to tell 404 and 409 apart.
   */
  async resolve(
    coachRequestId: string,
    coachId: string,
    status: Extract<CoachRequestStatus, "accepted" | "rejected">,
  ) {
    const [affected, rows] = await CoachRequest.update(
      { status, respondedAt: new Date() },
      {
        where: { id: coachRequestId, coachId, status: "pending" },
        returning: true,
      },
    );

    if (affected > 0) return rows[0];

    const existing = await CoachRequest.findByPk(coachRequestId);
    if (!existing || existing.coachId !== coachId) {
      throw createError("Coach request not found.", 404);
    }
    throw createError("This request has already been handled.", 409);
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
};
