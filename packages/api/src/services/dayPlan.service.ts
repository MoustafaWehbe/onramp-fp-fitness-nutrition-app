import { DayPlan, Meal, MealItem, Workout, Exercise } from "../models";

export const dayPlanService = {
  async getFullDetail(dayPlanId: string) {
    const dayPlan = await DayPlan.findByPk(dayPlanId, {
      include: [
        {
          model: Meal,
          as: "meals",
          separate: true, 
          order: [["sortOrder", "ASC"]],
          include: [
            {
              model: MealItem,
              as: "items",
            },
          ],
        },
        {
          model: Workout,
          as: "workout",
          include: [
            {
              model: Exercise,
              as: "exercises",
              separate: true,
              order: [["sortOrder", "ASC"]],
            },
          ],
        },
      ],
    });

    if (!dayPlan) throw new Error("Day plan not found");
    return dayPlan;
  },
};