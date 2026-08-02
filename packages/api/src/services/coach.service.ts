import { User } from "../models";

export const coachService = {
  async listAvailable() {
    return User.findAll({
      where: { role: "coach" },
      attributes: ["id", "name", "email"],
      order: [["name", "ASC"]],
    });
  },
};