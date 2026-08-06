import { User, CoachProfile } from "../models";

export const coachService = {
  async listAvailable() {
    return User.findAll({
      where: { role: "coach" },
      attributes: ["id", "name", "email"],
      include: [{ model: CoachProfile, as: "coachProfile" }],
      order: [["name", "ASC"]],
    });
  },
};