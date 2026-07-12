import { Program, DayPlan } from "../models";

/**
 * Maps a catalog `Program` row to the shape the web browse/detail pages expect.
 * (`weeks` -> `durationWeeks`, `calories` -> `dailyCalories`, etc.)
 */
function serializeCatalogProgram(program: Program) {
  return {
    id: program.id,
    slug: program.slug,
    title: program.title,
    goal: program.goal,
    level: program.level,
    tagline: program.tagline,
    description: program.description,
    durationWeeks: program.weeks,
    daysPerWeek: program.daysPerWeek,
    dailyCalories: program.calories,
    macros: program.macros,
    focus: program.focus,
    equipment: program.equipment,
    image: program.image,
    rating: program.rating,
    enrolled: program.enrolled,
    sampleWeek: program.sampleWeek,
    sampleMeals: program.sampleMeals,
  };
}

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

  async listCatalog() {
    const programs = await Program.findAll({
      where: { isCatalog: true },
      order: [["enrolled", "DESC"]],
    });
    return programs.map(serializeCatalogProgram);
  },

  async getCatalogBySlug(slug: string) {
    const program = await Program.findOne({ where: { slug, isCatalog: true } });
    return program ? serializeCatalogProgram(program) : null;
  },
};
