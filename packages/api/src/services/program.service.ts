import { Program, DayPlan } from "../models";

export const programService = {
  async getActiveProgram(userId: string) {
    const program = await Program.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    if (!program) throw new Error("No active program found");
    return program;
  },

  async getDayPlans(programId: string) {
    const dayPlans = await DayPlan.findAll({
      where: { programId },
      order: [["dayNumber", "ASC"]],
      attributes: ["id", "dayNumber", "label", "date", "isRestDay"],
    });
    return dayPlans;
  },
};