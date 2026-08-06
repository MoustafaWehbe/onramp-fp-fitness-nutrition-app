"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface) {
    // ── 0. Today's date (used everywhere below) ─────────────────────────────
    const today = new Date();
    const dayLabels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // ── 1. Get your user id from the DB ──────────────────────────────────────
    const [users] = await queryInterface.sequelize.query(
      `SELECT id FROM users LIMIT 1`
    );
    const userId = users[0]?.id;
    if (!userId) throw new Error("No user found — register first, then seed");

    // ── 2. Program ────────────────────────────────────────────────────────────
    const programId = uuidv4();
    await queryInterface.bulkInsert("programs", [{
      id: programId,
      user_id: userId,
      title: "Lose 10kg in 5 Months",
      goal: "Fat Loss",
      duration: "20 weeks",
      weeks: 20,
      level: "Intermediate",
      calories: 1850,
      color: "#6366f1",
      accent: "#a5b4fc",
      // Explicit: programs.status defaults to `draft` for the coach builder.
      status: "published",
      start_date: today.toISOString().split("T")[0],
      current_week: 1,
      current_day: 1,
      completed_days: 0,
      total_days: 140,
      adherence_rate: 0,
      created_at: new Date(),
      updated_at: new Date(),
    }]);

    // ── 3. Day plans (today + next 6 days) ──────────────────────────────────
    const days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        day: i + 1,
        label: dayLabels[date.getDay() === 0 ? 6 : date.getDay() - 1],
        date: date.toISOString().split("T")[0],
        isRestDay: [4, 7].includes(i + 1),
      };
    });

    const dayPlanIds = {};
    for (const d of days) {
      const id = uuidv4();
      dayPlanIds[d.day] = id;
      await queryInterface.bulkInsert("day_plans", [{
        id,
        program_id: programId,
        day_number: d.day,
        label: d.label,
        date: d.date,
        is_rest_day: d.isRestDay,
        created_at: new Date(),
        updated_at: new Date(),
      }]);
    }

    // ── 4. Meals + items (Monday as example — repeat for all days) ────────────
    const mealsData = {
      1: [ // Monday
        {
          type: "breakfast", time: "7:30 AM", sortOrder: 0,
          totalCalories: 420, totalProtein: 32, totalCarbs: 48, totalFat: 10,
          items: [
            { name: "Greek Yogurt",  quantity: "200g",  calories: 130, protein: 18,  carbs: 9,  fat: 3   },
            { name: "Oats",          quantity: "60g",   calories: 210, protein: 8,   carbs: 36, fat: 4   },
            { name: "Blueberries",   quantity: "80g",   calories: 46,  protein: 0.5, carbs: 11, fat: 0.3 },
            { name: "Honey",         quantity: "1 tsp", calories: 34,  protein: 0,   carbs: 9,  fat: 0   },
          ],
        },
        {
          type: "snack", time: "10:30 AM", sortOrder: 1,
          totalCalories: 180, totalProtein: 15, totalCarbs: 20, totalFat: 4,
          items: [
            { name: "Apple",         quantity: "1 medium", calories: 80,  protein: 0.4, carbs: 21, fat: 0.3 },
            { name: "Almond Butter", quantity: "1 tbsp",   calories: 100, protein: 3,   carbs: 3,  fat: 9   },
          ],
        },
        {
          type: "lunch", time: "1:00 PM", sortOrder: 2,
          totalCalories: 540, totalProtein: 45, totalCarbs: 52, totalFat: 14,
          items: [
            { name: "Grilled Chicken Breast", quantity: "160g",        calories: 265, protein: 50,  carbs: 0,  fat: 6   },
            { name: "Brown Rice",             quantity: "120g cooked", calories: 165, protein: 3.5, carbs: 35, fat: 1.5 },
            { name: "Steamed Broccoli",       quantity: "150g",        calories: 51,  protein: 4.2, carbs: 10, fat: 0.6 },
            { name: "Olive Oil",              quantity: "1 tsp",       calories: 40,  protein: 0,   carbs: 0,  fat: 4.5 },
          ],
        },
        {
          type: "snack", time: "4:00 PM", sortOrder: 3,
          totalCalories: 210, totalProtein: 25, totalCarbs: 10, totalFat: 8,
          items: [
            { name: "Cottage Cheese", quantity: "150g", calories: 130, protein: 18, carbs: 5, fat: 5  },
            { name: "Walnuts",        quantity: "20g",  calories: 131, protein: 3,  carbs: 3, fat: 13 },
          ],
        },
        {
          type: "dinner", time: "7:30 PM", sortOrder: 4,
          totalCalories: 500, totalProtein: 42, totalCarbs: 45, totalFat: 14,
          items: [
            { name: "Salmon Fillet", quantity: "150g",  calories: 280, protein: 40, carbs: 0,  fat: 14  },
            { name: "Sweet Potato",  quantity: "150g",  calories: 130, protein: 2,  carbs: 30, fat: 0.1 },
            { name: "Mixed Salad",   quantity: "100g",  calories: 25,  protein: 1.5,carbs: 4,  fat: 0.4 },
            { name: "Lemon Dressing",quantity: "1 tbsp",calories: 45,  protein: 0,  carbs: 2,  fat: 4.5 },
          ],
        },
      ],
      // Add remaining days 2-7 following the same pattern from your mockData.ts
    };

    for (const [dayNum, meals] of Object.entries(mealsData)) {
      const dayPlanId = dayPlanIds[Number(dayNum)];
      for (const meal of meals) {
        const mealId = uuidv4();
        await queryInterface.bulkInsert("meals", [{
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
        }]);

        for (const item of meal.items) {
          await queryInterface.bulkInsert("meal_items", [{
            id: uuidv4(),
            meal_id: mealId,
            name: item.name,
            quantity: item.quantity,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            created_at: new Date(),
            updated_at: new Date(),
          }]);
        }
      }
    }

    // ── 5. Workouts + exercises (Monday) ──────────────────────────────────────
    const workoutsData = {
      1: {
        name: "Upper Body Strength A", type: "Strength", duration: "55 min",
        exercises: [
          { name: "Barbell Bench Press",  sets: 4, reps: "8-10",  rest: "90s", muscle: "Chest",    notes: null, sort: 0 },
          { name: "Incline Dumbbell Press",sets:3, reps: "10-12", rest: "75s", muscle: "Chest",    notes: null, sort: 1 },
          { name: "Seated Cable Row",     sets: 4, reps: "10-12", rest: "75s", muscle: "Back",     notes: null, sort: 2 },
          { name: "Lat Pulldown",         sets: 3, reps: "10-12", rest: "75s", muscle: "Back",     notes: null, sort: 3 },
          { name: "Overhead Press",       sets: 3, reps: "8-10",  rest: "90s", muscle: "Shoulders",notes: null, sort: 4 },
          { name: "Tricep Dips",          sets: 3, reps: "12-15", rest: "60s", muscle: "Triceps",  notes: null, sort: 5 },
          { name: "Bicep Curl",           sets: 3, reps: "12-15", rest: "60s", muscle: "Biceps",   notes: null, sort: 6 },
        ],
      },
      2: {
        name: "HIIT Cardio", type: "Cardio", duration: "35 min",
        exercises: [
          { name: "Warm Up Jog",      sets: 1, reps: "5 min",          rest: "0s",  muscle: "Full Body",    notes: null, sort: 0 },
          { name: "Sprint Intervals", sets: 8, reps: "30s on / 30s off",rest: "30s", muscle: "Legs / Cardio",notes: null, sort: 1 },
          { name: "Jump Squats",      sets: 4, reps: "15 reps",         rest: "45s", muscle: "Legs",         notes: null, sort: 2 },
          { name: "Burpees",          sets: 4, reps: "12 reps",         rest: "45s", muscle: "Full Body",    notes: null, sort: 3 },
          { name: "Mountain Climbers",sets: 4, reps: "30s",             rest: "30s", muscle: "Core",         notes: null, sort: 4 },
          { name: "Cool Down Walk",   sets: 1, reps: "5 min",           rest: "0s",  muscle: "Full Body",    notes: null, sort: 5 },
        ],
      },
      3: {
        name: "Lower Body Power", type: "Strength", duration: "60 min",
        exercises: [
          { name: "Barbell Back Squat",sets: 4, reps: "8-10",        rest: "120s", muscle: "Quads / Glutes", notes: null, sort: 0 },
          { name: "Romanian Deadlift", sets: 4, reps: "10-12",       rest: "90s",  muscle: "Hamstrings",     notes: null, sort: 1 },
          { name: "Leg Press",         sets: 3, reps: "12-15",       rest: "75s",  muscle: "Quads",          notes: null, sort: 2 },
          { name: "Walking Lunges",    sets: 3, reps: "12 each leg", rest: "75s",  muscle: "Legs",           notes: null, sort: 3 },
          { name: "Calf Raises",       sets: 4, reps: "15-20",       rest: "60s",  muscle: "Calves",         notes: null, sort: 4 },
          { name: "Plank",             sets: 3, reps: "45s hold",    rest: "60s",  muscle: "Core",           notes: null, sort: 5 },
          { name: "Hanging Leg Raise", sets: 3, reps: "12-15",       rest: "60s",  muscle: "Core",           notes: null, sort: 6 },
        ],
      },
      5: {
        name: "Upper Body Strength B", type: "Strength", duration: "55 min",
        exercises: [
          { name: "Pull-Ups",            sets: 4, reps: "6-10",       rest: "90s", muscle: "Back / Biceps", notes: null, sort: 0 },
          { name: "Dumbbell Row",        sets: 3, reps: "10-12 each", rest: "75s", muscle: "Back",          notes: null, sort: 1 },
          { name: "Push-Ups (Weighted)", sets: 4, reps: "12-15",      rest: "75s", muscle: "Chest",         notes: null, sort: 2 },
          { name: "Arnold Press",        sets: 3, reps: "10-12",      rest: "75s", muscle: "Shoulders",     notes: null, sort: 3 },
          { name: "Face Pulls",          sets: 3, reps: "15-20",      rest: "60s", muscle: "Rear Delts",    notes: null, sort: 4 },
          { name: "Hammer Curl",         sets: 3, reps: "12-15",      rest: "60s", muscle: "Biceps",        notes: null, sort: 5 },
          { name: "Skull Crushers",      sets: 3, reps: "12-15",      rest: "60s", muscle: "Triceps",       notes: null, sort: 6 },
        ],
      },
      6: {
        name: "Active Recovery & Mobility", type: "Mobility", duration: "40 min",
        exercises: [
          { name: "Foam Rolling",       sets: 1, reps: "10 min",          rest: "0s",  muscle: "Full Body", notes: null,                        sort: 0 },
          { name: "Hip Flexor Stretch", sets: 3, reps: "45s each side",   rest: "15s", muscle: "Hips",      notes: null,                        sort: 1 },
          { name: "Shoulder Mobility",  sets: 3, reps: "12 reps",         rest: "30s", muscle: "Shoulders", notes: null,                        sort: 2 },
          { name: "Cat-Cow Flow",       sets: 3, reps: "10 slow reps",    rest: "15s", muscle: "Spine",     notes: null,                        sort: 3 },
          { name: "Light Walk",         sets: 1, reps: "20 min",          rest: "0s",  muscle: "Cardio",    notes: "Pace: easy, conversational", sort: 4 },
        ],
      },
      // Days 4 and 7 are rest days — no workout rows
    };

    for (const [dayNum, workout] of Object.entries(workoutsData)) {
      const dayPlanId = dayPlanIds[Number(dayNum)];
      const workoutId = uuidv4();
      await queryInterface.bulkInsert("workouts", [{
        id: workoutId,
        day_plan_id: dayPlanId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        created_at: new Date(),
        updated_at: new Date(),
      }]);

      for (const ex of workout.exercises) {
        await queryInterface.bulkInsert("exercises", [{
          id: uuidv4(),
          workout_id: workoutId,
          sort_order: ex.sort,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          rest: ex.rest,
          muscle: ex.muscle,
          notes: ex.notes,
          created_at: new Date(),
          updated_at: new Date(),
        }]);
      }
    }
  },

  async down(queryInterface) {
    // Delete in reverse FK order
    await queryInterface.bulkDelete("exercises", null, {});
    await queryInterface.bulkDelete("workouts", null, {});
    await queryInterface.bulkDelete("meal_items", null, {});
    await queryInterface.bulkDelete("meals", null, {});
    await queryInterface.bulkDelete("day_plans", null, {});
    await queryInterface.bulkDelete("programs", null, {});
  },
};