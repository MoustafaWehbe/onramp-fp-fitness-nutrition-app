"use strict";

const { v4: uuidv4 } = require("uuid");

const mealPlans = {
  2: [
    {
      type: "breakfast",
      time: "7:30 AM",
      sortOrder: 0,
      totalCalories: 390,
      totalProtein: 34,
      totalCarbs: 36,
      totalFat: 12,
      items: [
        ["Egg White Scramble", "220g", 150, 28, 3, 1],
        ["Avocado Toast", "1 slice", 190, 5, 24, 9],
        ["Cherry Tomatoes", "100g", 50, 1, 9, 2],
      ],
    },
    {
      type: "snack",
      time: "10:30 AM",
      sortOrder: 1,
      totalCalories: 170,
      totalProtein: 22,
      totalCarbs: 12,
      totalFat: 4,
      items: [["Protein Shake", "1 scoop", 170, 22, 12, 4]],
    },
    {
      type: "lunch",
      time: "1:00 PM",
      sortOrder: 2,
      totalCalories: 520,
      totalProtein: 43,
      totalCarbs: 58,
      totalFat: 13,
      items: [
        ["Turkey Wrap", "1 large", 330, 32, 42, 8],
        ["Carrot Sticks", "120g", 50, 1, 12, 0],
        ["Greek Yogurt Dip", "80g", 140, 10, 4, 5],
      ],
    },
    {
      type: "snack",
      time: "4:00 PM",
      sortOrder: 3,
      totalCalories: 210,
      totalProtein: 16,
      totalCarbs: 22,
      totalFat: 7,
      items: [["Cottage Cheese Bowl", "180g", 210, 16, 22, 7]],
    },
    {
      type: "dinner",
      time: "7:30 PM",
      sortOrder: 4,
      totalCalories: 560,
      totalProtein: 46,
      totalCarbs: 48,
      totalFat: 18,
      items: [
        ["Lean Beef Stir Fry", "180g", 330, 38, 12, 14],
        ["Jasmine Rice", "130g cooked", 170, 4, 36, 1],
        ["Mixed Vegetables", "160g", 60, 4, 10, 3],
      ],
    },
  ],
  3: [
    {
      type: "breakfast",
      time: "7:30 AM",
      sortOrder: 0,
      totalCalories: 410,
      totalProtein: 35,
      totalCarbs: 45,
      totalFat: 9,
      items: [
        ["Protein Oats", "1 bowl", 300, 28, 42, 6],
        ["Strawberries", "120g", 45, 1, 11, 0],
        ["Chia Seeds", "10g", 65, 2, 4, 3],
      ],
    },
    {
      type: "snack",
      time: "10:30 AM",
      sortOrder: 1,
      totalCalories: 190,
      totalProtein: 18,
      totalCarbs: 18,
      totalFat: 6,
      items: [["Skyr With Kiwi", "180g", 190, 18, 18, 6]],
    },
    {
      type: "lunch",
      time: "1:00 PM",
      sortOrder: 2,
      totalCalories: 530,
      totalProtein: 44,
      totalCarbs: 55,
      totalFat: 14,
      items: [
        ["Chicken Quinoa Bowl", "1 bowl", 410, 39, 45, 10],
        ["Cucumber Salad", "120g", 60, 2, 8, 2],
        ["Tahini Lemon Sauce", "1 tbsp", 60, 3, 2, 2],
      ],
    },
    {
      type: "snack",
      time: "4:00 PM",
      sortOrder: 3,
      totalCalories: 190,
      totalProtein: 14,
      totalCarbs: 20,
      totalFat: 7,
      items: [["Boiled Eggs and Fruit", "2 eggs + 1 orange", 190, 14, 20, 7]],
    },
    {
      type: "dinner",
      time: "7:30 PM",
      sortOrder: 4,
      totalCalories: 530,
      totalProtein: 45,
      totalCarbs: 42,
      totalFat: 18,
      items: [
        ["Baked Cod", "180g", 210, 40, 0, 5],
        ["Roasted Potatoes", "180g", 190, 4, 40, 2],
        ["Green Beans", "160g", 70, 3, 12, 2],
        ["Olive Oil", "1 tsp", 60, 0, 0, 7],
      ],
    },
  ],
  5: [
    {
      type: "breakfast",
      time: "7:30 AM",
      sortOrder: 0,
      totalCalories: 400,
      totalProtein: 32,
      totalCarbs: 44,
      totalFat: 10,
      items: [["Greek Yogurt Parfait", "1 bowl", 400, 32, 44, 10]],
    },
    {
      type: "snack",
      time: "10:30 AM",
      sortOrder: 1,
      totalCalories: 180,
      totalProtein: 20,
      totalCarbs: 16,
      totalFat: 5,
      items: [["Protein Bar", "1 bar", 180, 20, 16, 5]],
    },
    {
      type: "lunch",
      time: "1:00 PM",
      sortOrder: 2,
      totalCalories: 540,
      totalProtein: 42,
      totalCarbs: 52,
      totalFat: 16,
      items: [["Tuna Pasta Salad", "1 bowl", 540, 42, 52, 16]],
    },
    {
      type: "snack",
      time: "4:00 PM",
      sortOrder: 3,
      totalCalories: 200,
      totalProtein: 15,
      totalCarbs: 24,
      totalFat: 6,
      items: [["Apple and Peanut Butter", "1 serving", 200, 15, 24, 6]],
    },
    {
      type: "dinner",
      time: "7:30 PM",
      sortOrder: 4,
      totalCalories: 530,
      totalProtein: 44,
      totalCarbs: 40,
      totalFat: 19,
      items: [["Chicken Fajita Plate", "1 plate", 530, 44, 40, 19]],
    },
  ],
  6: [
    {
      type: "breakfast",
      time: "8:00 AM",
      sortOrder: 0,
      totalCalories: 380,
      totalProtein: 28,
      totalCarbs: 42,
      totalFat: 10,
      items: [["Cottage Cheese Pancakes", "3 pancakes", 380, 28, 42, 10]],
    },
    {
      type: "snack",
      time: "11:00 AM",
      sortOrder: 1,
      totalCalories: 180,
      totalProtein: 14,
      totalCarbs: 18,
      totalFat: 6,
      items: [["Edamame Cup", "150g", 180, 14, 18, 6]],
    },
    {
      type: "lunch",
      time: "1:30 PM",
      sortOrder: 2,
      totalCalories: 520,
      totalProtein: 40,
      totalCarbs: 50,
      totalFat: 16,
      items: [["Chicken Shawarma Bowl", "1 bowl", 520, 40, 50, 16]],
    },
    {
      type: "snack",
      time: "4:30 PM",
      sortOrder: 3,
      totalCalories: 210,
      totalProtein: 18,
      totalCarbs: 20,
      totalFat: 7,
      items: [["Skyr and Granola", "1 cup", 210, 18, 20, 7]],
    },
    {
      type: "dinner",
      time: "7:30 PM",
      sortOrder: 4,
      totalCalories: 560,
      totalProtein: 44,
      totalCarbs: 45,
      totalFat: 20,
      items: [["Shrimp Rice Noodle Bowl", "1 bowl", 560, 44, 45, 20]],
    },
  ],
};

module.exports = {
  async up(queryInterface) {
    const [programs] = await queryInterface.sequelize.query(
      "SELECT id FROM programs WHERE title = :title ORDER BY created_at DESC LIMIT 1",
      { replacements: { title: "Lose 10kg in 5 Months" } },
    );
    const programId = programs[0]?.id;
    if (!programId) return;

    for (const [dayNumber, meals] of Object.entries(mealPlans)) {
      const [days] = await queryInterface.sequelize.query(
        "SELECT id FROM day_plans WHERE program_id = :programId AND day_number = :dayNumber LIMIT 1",
        { replacements: { programId, dayNumber: Number(dayNumber) } },
      );
      const dayPlanId = days[0]?.id;
      if (!dayPlanId) continue;

      const [existingMeals] = await queryInterface.sequelize.query(
        "SELECT COUNT(*)::int AS count FROM meals WHERE day_plan_id = :dayPlanId",
        { replacements: { dayPlanId } },
      );
      if ((existingMeals[0]?.count ?? 0) > 0) continue;

      for (const meal of meals) {
        const mealId = uuidv4();
        await queryInterface.bulkInsert("meals", [
          {
            id: mealId,
            day_plan_id: dayPlanId,
            type: meal.type,
            sort_order: meal.sortOrder,
            time: meal.time,
            total_calories: meal.totalCalories,
            total_protein: meal.totalProtein,
            total_carbs: meal.totalCarbs,
            total_fat: meal.totalFat,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);

        await queryInterface.bulkInsert(
          "meal_items",
          meal.items.map(([name, quantity, calories, protein, carbs, fat]) => ({
            id: uuidv4(),
            meal_id: mealId,
            name,
            quantity,
            calories,
            protein,
            carbs,
            fat,
            created_at: new Date(),
            updated_at: new Date(),
          })),
        );
      }
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DELETE FROM meal_items
      WHERE meal_id IN (
        SELECT meals.id
        FROM meals
        JOIN day_plans ON day_plans.id = meals.day_plan_id
        JOIN programs ON programs.id = day_plans.program_id
        WHERE programs.title = 'Lose 10kg in 5 Months'
          AND day_plans.day_number IN (2, 3, 5, 6)
      );
    `);

    await queryInterface.sequelize.query(`
      DELETE FROM meals
      USING day_plans, programs
      WHERE meals.day_plan_id = day_plans.id
        AND day_plans.program_id = programs.id
        AND programs.title = 'Lose 10kg in 5 Months'
        AND day_plans.day_number IN (2, 3, 5, 6);
    `);
  },
};
