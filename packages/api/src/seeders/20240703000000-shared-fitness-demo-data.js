"use strict";

const userId = "0f45eed7-ba8c-498d-905d-b7c891c52541";
const planId = "10000000-0000-0000-0000-000000000001";

const now = new Date();

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("fitness_plans", [
      {
        id: planId,
        user_id: userId,
        slug: "lean-strength-8-week",
        name: "Lean Strength 8-Week Plan",
        focus: "Build strength while holding a small calorie deficit",
        calorie_target: 2200,
        protein_target: 165,
        workout_target_per_week: 5,
        starts_on: "2026-06-01",
        ends_on: "2026-07-26",
        is_active: true,
        created_at: now,
        updated_at: now,
      },
    ]);

    await queryInterface.bulkInsert("fitness_daily_logs", [
      ["2026-06-19", 2260, 158, 248, 69, "Upper strength day felt strong."],
      ["2026-06-20", 2135, 171, 214, 62, "Walked after dinner and hit protein."],
      ["2026-06-21", 2190, 162, 236, 65, "Recovery day with mobility work."],
      ["2026-06-22", 2325, 168, 260, 72, "Lower body session completed."],
      ["2026-06-23", 2180, 174, 221, 67, "Good hydration and sleep."],
      [
        "2026-06-24",
        2110,
        166,
        205,
        64,
        "Conditioning finisher was tough but done.",
      ],
      [
        "2026-06-25",
        2165,
        170,
        219,
        66,
        "Logged breakfast and planned dinner early.",
      ],
    ].map(([date, calories, protein, carbs, fat, note]) => ({
      user_id: userId,
      plan_id: planId,
      log_date: date,
      calories,
      protein,
      carbs,
      fat,
      note,
      created_at: now,
      updated_at: now,
    })));

    await queryInterface.bulkInsert("fitness_workout_logs", [
      ["2026-06-01", "Upper Strength", true, 58],
      ["2026-06-03", "Lower Strength", true, 62],
      ["2026-06-05", "Conditioning", true, 35],
      ["2026-06-08", "Upper Strength", true, 60],
      ["2026-06-10", "Lower Strength", true, 63],
      ["2026-06-12", "Push/Pull", true, 57],
      ["2026-06-14", "Conditioning", true, 38],
      ["2026-06-15", "Upper Strength", true, 61],
      ["2026-06-17", "Lower Strength", true, 64],
      ["2026-06-19", "Push/Pull", true, 55],
      ["2026-06-21", "Recovery Mobility", false, 20],
      ["2026-06-22", "Lower Body", true, 66],
      ["2026-06-23", "Upper Strength", true, 59],
      ["2026-06-24", "Conditioning", true, 36],
      ["2026-06-25", "Push/Pull", true, 57],
      ["2026-06-26", "Lower Strength", true, 63],
    ].map(([date, workoutName, completed, durationMinutes]) => ({
      user_id: userId,
      plan_id: planId,
      log_date: date,
      workout_name: workoutName,
      completed,
      duration_minutes: durationMinutes,
      created_at: now,
      updated_at: now,
    })));

    await queryInterface.bulkInsert("fitness_meal_logs", [
      ["2026-06-25", "breakfast", 510, 42, 58, 15, "Greek yogurt bowl"],
      ["2026-06-25", "lunch", 620, 54, 62, 18, "Chicken rice bowl"],
      ["2026-06-25", "snack", 285, 26, 24, 9, "Protein shake and fruit"],
      ["2026-06-25", "dinner", 750, 48, 75, 24, "Salmon, potatoes, greens"],
    ].map(([date, mealType, calories, protein, carbs, fat, note]) => ({
      user_id: userId,
      plan_id: planId,
      log_date: date,
      meal_type: mealType,
      calories,
      protein,
      carbs,
      fat,
      note,
      created_at: now,
      updated_at: now,
    })));

    await queryInterface.bulkInsert("fitness_body_measurements", [
      ["2026-06-01", 184.6, 35.5, 42.1, 40.2],
      ["2026-06-08", 183.8, 35.1, 42.2, 40.1],
      ["2026-06-15", 182.9, 34.8, 42.3, 39.9],
      ["2026-06-22", 181.7, 34.4, 42.4, 39.8],
    ].map(([date, weight, waist, chest, hips]) => ({
      user_id: userId,
      measured_on: date,
      weight,
      waist,
      chest,
      hips,
      created_at: now,
      updated_at: now,
    })));

    await queryInterface.bulkInsert("fitness_ai_chat_messages", [
      {
        user_id: userId,
        plan_id: planId,
        role: "assistant",
        content:
          "I am ready to coach from your Lean Strength 8-Week Plan and recent daily logs. Ask about meals, workouts, adherence, or recovery.",
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("fitness_ai_chat_messages", {
      user_id: userId,
    });
    await queryInterface.bulkDelete("fitness_body_measurements", {
      user_id: userId,
    });
    await queryInterface.bulkDelete("fitness_meal_logs", { user_id: userId });
    await queryInterface.bulkDelete("fitness_workout_logs", { user_id: userId });
    await queryInterface.bulkDelete("fitness_daily_logs", { user_id: userId });
    await queryInterface.bulkDelete("fitness_plans", { id: planId });
  },
};
