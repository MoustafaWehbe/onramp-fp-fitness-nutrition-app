// ─── Types ────────────────────────────────────────────────────────────────────

export type MealItem = {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export type Meal = {
  type: "breakfast" | "snack" | "lunch" | "dinner";
  time: string;
  items: MealItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  muscle: string;
  notes?: string;
};

export type WorkoutSession = {
  name: string;
  type: string;
  duration: string;
  exercises: Exercise[];
};

export type DayPlan = {
  day: number;
  label: string;
  date: string;
  isRestDay: boolean;
  meals: Meal[];
  workout: WorkoutSession | null;
};

export type Program = {
  id: string;
  title: string;
  goal: string;
  duration: string;
  weeks: number;
  level: string;
  calories: number;
  color: string;
  accent: string;
  startDate: string;
  currentWeek: number;
  currentDay: number;
  completedDays: number;
  totalDays: number;
  adherenceRate: number;
  weekPlan: DayPlan[];
};

export type MealLog = {
  mealType: string;
  followed: boolean;
  note: string;
  actualCalories?: number;
};

export type WorkoutLog = {
  status: "completed" | "skipped" | "modified";
  note: string;
  completedExercises?: string[];
};

export type DayLog = {
  date: string;
  meals: Record<string, MealLog>;
  workout: WorkoutLog | null;
};

// ─── Active Program ────────────────────────────────────────────────────────────

export const activeProgram: Program = {
  id: "lose-10kg",
  title: "Lose 10kg in 5 Months",
  goal: "Fat Loss",
  duration: "20 weeks",
  weeks: 20,
  level: "Intermediate",
  calories: 1850,
  color: "#6366f1",
  accent: "#a5b4fc",
  startDate: "2025-05-01",
  currentWeek: 7,
  currentDay: 3,
  completedDays: 45,
  totalDays: 140,
  adherenceRate: 82,
  weekPlan: [
    // Monday
    {
      day: 1,
      label: "Monday",
      date: "2025-06-16",
      isRestDay: false,
      meals: [
        {
          type: "breakfast",
          time: "7:30 AM",
          totalCalories: 420,
          totalProtein: 32,
          totalCarbs: 48,
          totalFat: 10,
          items: [
            { name: "Greek Yogurt", quantity: "200g", calories: 130, protein: 18, carbs: 9, fat: 3 },
            { name: "Oats", quantity: "60g", calories: 210, protein: 8, carbs: 36, fat: 4 },
            { name: "Blueberries", quantity: "80g", calories: 46, protein: 0.5, carbs: 11, fat: 0.3 },
            { name: "Honey", quantity: "1 tsp", calories: 34, protein: 0, carbs: 9, fat: 0 },
          ],
        },
        {
          type: "snack",
          time: "10:30 AM",
          totalCalories: 180,
          totalProtein: 15,
          totalCarbs: 20,
          totalFat: 4,
          items: [
            { name: "Apple", quantity: "1 medium", calories: 80, protein: 0.4, carbs: 21, fat: 0.3 },
            { name: "Almond Butter", quantity: "1 tbsp", calories: 100, protein: 3, carbs: 3, fat: 9 },
          ],
        },
        {
          type: "lunch",
          time: "1:00 PM",
          totalCalories: 540,
          totalProtein: 45,
          totalCarbs: 52,
          totalFat: 14,
          items: [
            { name: "Grilled Chicken Breast", quantity: "160g", calories: 265, protein: 50, carbs: 0, fat: 6 },
            { name: "Brown Rice", quantity: "120g cooked", calories: 165, protein: 3.5, carbs: 35, fat: 1.5 },
            { name: "Steamed Broccoli", quantity: "150g", calories: 51, protein: 4.2, carbs: 10, fat: 0.6 },
            { name: "Olive Oil", quantity: "1 tsp", calories: 40, protein: 0, carbs: 0, fat: 4.5 },
          ],
        },
        {
          type: "snack",
          time: "4:00 PM",
          totalCalories: 210,
          totalProtein: 25,
          totalCarbs: 10,
          totalFat: 8,
          items: [
            { name: "Cottage Cheese", quantity: "150g", calories: 130, protein: 18, carbs: 5, fat: 5 },
            { name: "Walnuts", quantity: "20g", calories: 131, protein: 3, carbs: 3, fat: 13 },
          ],
        },
        {
          type: "dinner",
          time: "7:30 PM",
          totalCalories: 500,
          totalProtein: 42,
          totalCarbs: 45,
          totalFat: 14,
          items: [
            { name: "Salmon Fillet", quantity: "150g", calories: 280, protein: 40, carbs: 0, fat: 14 },
            { name: "Sweet Potato", quantity: "150g", calories: 130, protein: 2, carbs: 30, fat: 0.1 },
            { name: "Mixed Salad", quantity: "100g", calories: 25, protein: 1.5, carbs: 4, fat: 0.4 },
            { name: "Lemon Dressing", quantity: "1 tbsp", calories: 45, protein: 0, carbs: 2, fat: 4.5 },
          ],
        },
      ],
      workout: {
        name: "Upper Body Strength A",
        type: "Strength",
        duration: "55 min",
        exercises: [
          { name: "Barbell Bench Press", sets: 4, reps: "8-10", rest: "90s", muscle: "Chest" },
          { name: "Incline Dumbbell Press", sets: 3, reps: "10-12", rest: "75s", muscle: "Chest" },
          { name: "Seated Cable Row", sets: 4, reps: "10-12", rest: "75s", muscle: "Back" },
          { name: "Lat Pulldown", sets: 3, reps: "10-12", rest: "75s", muscle: "Back" },
          { name: "Overhead Press", sets: 3, reps: "8-10", rest: "90s", muscle: "Shoulders" },
          { name: "Tricep Dips", sets: 3, reps: "12-15", rest: "60s", muscle: "Triceps" },
          { name: "Bicep Curl", sets: 3, reps: "12-15", rest: "60s", muscle: "Biceps" },
        ],
      },
    },
    // Tuesday
    {
      day: 2,
      label: "Tuesday",
      date: "2025-06-17",
      isRestDay: false,
      meals: [
        {
          type: "breakfast",
          time: "7:30 AM",
          totalCalories: 380,
          totalProtein: 28,
          totalCarbs: 42,
          totalFat: 9,
          items: [
            { name: "Scrambled Eggs", quantity: "3 large", calories: 210, protein: 18, carbs: 2, fat: 15 },
            { name: "Whole Grain Toast", quantity: "2 slices", calories: 140, protein: 6, carbs: 28, fat: 2 },
            { name: "Avocado", quantity: "½ medium", calories: 80, protein: 1, carbs: 4, fat: 7.5 },
          ],
        },
        {
          type: "snack",
          time: "10:30 AM",
          totalCalories: 160,
          totalProtein: 6,
          totalCarbs: 22,
          totalFat: 5,
          items: [
            { name: "Banana", quantity: "1 medium", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
            { name: "Cashews", quantity: "15g", calories: 85, protein: 2.5, carbs: 5, fat: 7 },
          ],
        },
        {
          type: "lunch",
          time: "1:00 PM",
          totalCalories: 520,
          totalProtein: 40,
          totalCarbs: 55,
          totalFat: 12,
          items: [
            { name: "Turkey Wrap", quantity: "1 large", calories: 380, protein: 32, carbs: 40, fat: 9 },
            { name: "Side Salad", quantity: "1 bowl", calories: 70, protein: 3, carbs: 10, fat: 2 },
            { name: "Hummus", quantity: "2 tbsp", calories: 70, protein: 2, carbs: 6, fat: 4 },
          ],
        },
        {
          type: "snack",
          time: "4:00 PM",
          totalCalories: 190,
          totalProtein: 20,
          totalCarbs: 12,
          totalFat: 6,
          items: [
            { name: "Protein Shake", quantity: "1 scoop + water", calories: 140, protein: 25, carbs: 5, fat: 2 },
            { name: "Rice Cake", quantity: "2 pieces", calories: 70, protein: 1.5, carbs: 15, fat: 0.5 },
          ],
        },
        {
          type: "dinner",
          time: "7:30 PM",
          totalCalories: 480,
          totalProtein: 38,
          totalCarbs: 40,
          totalFat: 16,
          items: [
            { name: "Lean Beef Stir Fry", quantity: "150g beef", calories: 320, protein: 36, carbs: 8, fat: 18 },
            { name: "Jasmine Rice", quantity: "100g cooked", calories: 130, protein: 2.5, carbs: 29, fat: 0.3 },
            { name: "Stir Fry Vegetables", quantity: "200g", calories: 60, protein: 3, carbs: 12, fat: 0.5 },
          ],
        },
      ],
      workout: {
        name: "HIIT Cardio",
        type: "Cardio",
        duration: "35 min",
        exercises: [
          { name: "Warm Up Jog", sets: 1, reps: "5 min", rest: "0s", muscle: "Full Body" },
          { name: "Sprint Intervals", sets: 8, reps: "30s on / 30s off", rest: "30s", muscle: "Legs / Cardio" },
          { name: "Jump Squats", sets: 4, reps: "15 reps", rest: "45s", muscle: "Legs" },
          { name: "Burpees", sets: 4, reps: "12 reps", rest: "45s", muscle: "Full Body" },
          { name: "Mountain Climbers", sets: 4, reps: "30s", rest: "30s", muscle: "Core" },
          { name: "Cool Down Walk", sets: 1, reps: "5 min", rest: "0s", muscle: "Full Body" },
        ],
      },
    },
    // Wednesday
    {
      day: 3,
      label: "Wednesday",
      date: "2025-06-18",
      isRestDay: false,
      meals: [
        {
          type: "breakfast",
          time: "7:30 AM",
          totalCalories: 400,
          totalProtein: 30,
          totalCarbs: 44,
          totalFat: 11,
          items: [
            { name: "Greek Yogurt Parfait", quantity: "250g", calories: 200, protein: 18, carbs: 22, fat: 5 },
            { name: "Granola", quantity: "40g", calories: 160, protein: 4, carbs: 26, fat: 5 },
            { name: "Strawberries", quantity: "100g", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
          ],
        },
        {
          type: "snack",
          time: "10:30 AM",
          totalCalories: 150,
          totalProtein: 10,
          totalCarbs: 18,
          totalFat: 4,
          items: [
            { name: "Hard-Boiled Eggs", quantity: "2 eggs", calories: 140, protein: 12, carbs: 1, fat: 10 },
          ],
        },
        {
          type: "lunch",
          time: "1:00 PM",
          totalCalories: 560,
          totalProtein: 44,
          totalCarbs: 50,
          totalFat: 16,
          items: [
            { name: "Tuna Pasta Salad", quantity: "1 serving", calories: 420, protein: 38, carbs: 38, fat: 12 },
            { name: "Whole Wheat Bread", quantity: "1 slice", calories: 80, protein: 3.5, carbs: 15, fat: 1 },
            { name: "Mixed Greens", quantity: "80g", calories: 20, protein: 1.5, carbs: 3, fat: 0.2 },
          ],
        },
        {
          type: "snack",
          time: "4:00 PM",
          totalCalories: 200,
          totalProtein: 14,
          totalCarbs: 26,
          totalFat: 5,
          items: [
            { name: "Orange", quantity: "1 large", calories: 85, protein: 1.7, carbs: 21, fat: 0.2 },
            { name: "String Cheese", quantity: "1 stick (28g)", calories: 80, protein: 7, carbs: 0.5, fat: 5 },
            { name: "Almonds", quantity: "10g", calories: 58, protein: 2, carbs: 2, fat: 5 },
          ],
        },
        {
          type: "dinner",
          time: "7:30 PM",
          totalCalories: 510,
          totalProtein: 44,
          totalCarbs: 44,
          totalFat: 14,
          items: [
            { name: "Baked Cod", quantity: "180g", calories: 180, protein: 40, carbs: 0, fat: 2 },
            { name: "Quinoa", quantity: "120g cooked", calories: 148, protein: 5.5, carbs: 27, fat: 2.5 },
            { name: "Roasted Asparagus", quantity: "150g", calories: 45, protein: 4, carbs: 8, fat: 0.2 },
            { name: "Cherry Tomatoes", quantity: "100g", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2 },
          ],
        },
      ],
      workout: {
        name: "Lower Body Power",
        type: "Strength",
        duration: "60 min",
        exercises: [
          { name: "Barbell Back Squat", sets: 4, reps: "8-10", rest: "120s", muscle: "Quads / Glutes" },
          { name: "Romanian Deadlift", sets: 4, reps: "10-12", rest: "90s", muscle: "Hamstrings" },
          { name: "Leg Press", sets: 3, reps: "12-15", rest: "75s", muscle: "Quads" },
          { name: "Walking Lunges", sets: 3, reps: "12 each leg", rest: "75s", muscle: "Legs" },
          { name: "Calf Raises", sets: 4, reps: "15-20", rest: "60s", muscle: "Calves" },
          { name: "Plank", sets: 3, reps: "45s hold", rest: "60s", muscle: "Core" },
          { name: "Hanging Leg Raise", sets: 3, reps: "12-15", rest: "60s", muscle: "Core" },
        ],
      },
    },
    // Thursday — Rest Day
    {
      day: 4,
      label: "Thursday",
      date: "2025-06-19",
      isRestDay: true,
      meals: [
        {
          type: "breakfast",
          time: "8:00 AM",
          totalCalories: 350,
          totalProtein: 22,
          totalCarbs: 40,
          totalFat: 10,
          items: [
            { name: "Smoothie Bowl", quantity: "1 bowl", calories: 280, protein: 15, carbs: 38, fat: 8 },
            { name: "Chia Seeds", quantity: "1 tbsp", calories: 70, protein: 2.5, carbs: 6, fat: 4.5 },
          ],
        },
        {
          type: "snack",
          time: "11:00 AM",
          totalCalories: 130,
          totalProtein: 8,
          totalCarbs: 15,
          totalFat: 4,
          items: [
            { name: "Pear", quantity: "1 medium", calories: 100, protein: 0.6, carbs: 27, fat: 0.2 },
            { name: "Peanut Butter", quantity: "½ tbsp", calories: 47, protein: 2, carbs: 2, fat: 4 },
          ],
        },
        {
          type: "lunch",
          time: "1:00 PM",
          totalCalories: 490,
          totalProtein: 35,
          totalCarbs: 48,
          totalFat: 14,
          items: [
            { name: "Chicken Caesar Salad", quantity: "1 serving", calories: 490, protein: 35, carbs: 20, fat: 28 },
          ],
        },
        {
          type: "snack",
          time: "4:30 PM",
          totalCalories: 170,
          totalProtein: 12,
          totalCarbs: 18,
          totalFat: 5,
          items: [
            { name: "Mixed Nuts", quantity: "25g", calories: 155, protein: 4, carbs: 6, fat: 13 },
            { name: "Grapes", quantity: "80g", calories: 55, protein: 0.5, carbs: 14, fat: 0.1 },
          ],
        },
        {
          type: "dinner",
          time: "7:30 PM",
          totalCalories: 460,
          totalProtein: 38,
          totalCarbs: 38,
          totalFat: 14,
          items: [
            { name: "Shrimp Stir Fry", quantity: "200g shrimp", calories: 260, protein: 38, carbs: 4, fat: 10 },
            { name: "Brown Rice", quantity: "100g cooked", calories: 130, protein: 2.5, carbs: 28, fat: 1 },
            { name: "Bok Choy & Peppers", quantity: "200g", calories: 40, protein: 2, carbs: 8, fat: 0.3 },
          ],
        },
      ],
      workout: null,
    },
    // Friday
    {
      day: 5,
      label: "Friday",
      date: "2025-06-20",
      isRestDay: false,
      meals: [
        {
          type: "breakfast",
          time: "7:30 AM",
          totalCalories: 390,
          totalProtein: 28,
          totalCarbs: 45,
          totalFat: 10,
          items: [
            { name: "Protein Pancakes", quantity: "3 medium", calories: 300, protein: 24, carbs: 36, fat: 7 },
            { name: "Fresh Berries", quantity: "100g", calories: 45, protein: 0.8, carbs: 11, fat: 0.4 },
            { name: "Greek Yogurt", quantity: "50g", calories: 50, protein: 5, carbs: 3, fat: 1 },
          ],
        },
        {
          type: "snack",
          time: "10:30 AM",
          totalCalories: 165,
          totalProtein: 14,
          totalCarbs: 12,
          totalFat: 6,
          items: [
            { name: "Protein Bar", quantity: "1 bar (40g)", calories: 165, protein: 14, carbs: 17, fat: 5 },
          ],
        },
        {
          type: "lunch",
          time: "1:00 PM",
          totalCalories: 530,
          totalProtein: 42,
          totalCarbs: 52,
          totalFat: 13,
          items: [
            { name: "Grilled Chicken", quantity: "160g", calories: 260, protein: 48, carbs: 0, fat: 6 },
            { name: "Lentil Soup", quantity: "1 cup", calories: 180, protein: 14, carbs: 28, fat: 3 },
            { name: "Whole Grain Roll", quantity: "1 small", calories: 90, protein: 3, carbs: 18, fat: 1.5 },
          ],
        },
        {
          type: "snack",
          time: "4:00 PM",
          totalCalories: 175,
          totalProtein: 16,
          totalCarbs: 14,
          totalFat: 6,
          items: [
            { name: "Tuna on Crackers", quantity: "80g tuna + 4 crackers", calories: 175, protein: 20, carbs: 14, fat: 3 },
          ],
        },
        {
          type: "dinner",
          time: "7:30 PM",
          totalCalories: 490,
          totalProtein: 40,
          totalCarbs: 42,
          totalFat: 14,
          items: [
            { name: "Turkey Meatballs", quantity: "6 meatballs", calories: 280, protein: 32, carbs: 4, fat: 14 },
            { name: "Whole Wheat Pasta", quantity: "80g dry", calories: 280, protein: 10, carbs: 56, fat: 2 },
            { name: "Tomato Sauce", quantity: "100g", calories: 40, protein: 1.5, carbs: 8, fat: 0.5 },
          ],
        },
      ],
      workout: {
        name: "Upper Body Strength B",
        type: "Strength",
        duration: "55 min",
        exercises: [
          { name: "Pull-Ups", sets: 4, reps: "6-10", rest: "90s", muscle: "Back / Biceps" },
          { name: "Dumbbell Row", sets: 3, reps: "10-12 each", rest: "75s", muscle: "Back" },
          { name: "Push-Ups (Weighted)", sets: 4, reps: "12-15", rest: "75s", muscle: "Chest" },
          { name: "Arnold Press", sets: 3, reps: "10-12", rest: "75s", muscle: "Shoulders" },
          { name: "Face Pulls", sets: 3, reps: "15-20", rest: "60s", muscle: "Rear Delts" },
          { name: "Hammer Curl", sets: 3, reps: "12-15", rest: "60s", muscle: "Biceps" },
          { name: "Skull Crushers", sets: 3, reps: "12-15", rest: "60s", muscle: "Triceps" },
        ],
      },
    },
    // Saturday
    {
      day: 6,
      label: "Saturday",
      date: "2025-06-21",
      isRestDay: false,
      meals: [
        {
          type: "breakfast",
          time: "8:30 AM",
          totalCalories: 440,
          totalProtein: 24,
          totalCarbs: 52,
          totalFat: 13,
          items: [
            { name: "Avocado Toast", quantity: "2 slices", calories: 280, protein: 8, carbs: 32, fat: 15 },
            { name: "Poached Eggs", quantity: "2 eggs", calories: 140, protein: 12, carbs: 1, fat: 10 },
            { name: "Cherry Tomatoes", quantity: "60g", calories: 11, protein: 0.5, carbs: 2, fat: 0.1 },
          ],
        },
        {
          type: "snack",
          time: "11:30 AM",
          totalCalories: 150,
          totalProtein: 4,
          totalCarbs: 28,
          totalFat: 3,
          items: [
            { name: "Banana Protein Smoothie", quantity: "300ml", calories: 180, protein: 15, carbs: 22, fat: 3 },
          ],
        },
        {
          type: "lunch",
          time: "2:00 PM",
          totalCalories: 540,
          totalProtein: 38,
          totalCarbs: 52,
          totalFat: 16,
          items: [
            { name: "Beef & Vegetable Bowl", quantity: "1 bowl", calories: 540, protein: 38, carbs: 42, fat: 18 },
          ],
        },
        {
          type: "snack",
          time: "5:00 PM",
          totalCalories: 145,
          totalProtein: 8,
          totalCarbs: 18,
          totalFat: 4,
          items: [
            { name: "Low Fat Cheese", quantity: "30g", calories: 80, protein: 7, carbs: 1, fat: 5 },
            { name: "Apple", quantity: "1 small", calories: 65, protein: 0.3, carbs: 17, fat: 0.2 },
          ],
        },
        {
          type: "dinner",
          time: "7:30 PM",
          totalCalories: 470,
          totalProtein: 36,
          totalCarbs: 44,
          totalFat: 14,
          items: [
            { name: "Grilled Sea Bass", quantity: "160g", calories: 220, protein: 36, carbs: 0, fat: 8 },
            { name: "Couscous", quantity: "120g cooked", calories: 140, protein: 5, carbs: 28, fat: 1.5 },
            { name: "Grilled Zucchini", quantity: "150g", calories: 27, protein: 2, carbs: 5, fat: 0.4 },
            { name: "Olive Oil", quantity: "1 tsp", calories: 40, protein: 0, carbs: 0, fat: 4.5 },
          ],
        },
      ],
      workout: {
        name: "Active Recovery & Mobility",
        type: "Mobility",
        duration: "40 min",
        exercises: [
          { name: "Foam Rolling", sets: 1, reps: "10 min", rest: "0s", muscle: "Full Body" },
          { name: "Hip Flexor Stretch", sets: 3, reps: "45s each side", rest: "15s", muscle: "Hips" },
          { name: "Shoulder Mobility", sets: 3, reps: "12 reps", rest: "30s", muscle: "Shoulders" },
          { name: "Cat-Cow Flow", sets: 3, reps: "10 slow reps", rest: "15s", muscle: "Spine" },
          { name: "Light Walk", sets: 1, reps: "20 min", rest: "0s", muscle: "Cardio", notes: "Pace: easy, conversational" },
        ],
      },
    },
    // Sunday
    {
      day: 7,
      label: "Sunday",
      date: "2025-06-22",
      isRestDay: true,
      meals: [
        {
          type: "breakfast",
          time: "9:00 AM",
          totalCalories: 350,
          totalProtein: 20,
          totalCarbs: 38,
          totalFat: 11,
          items: [
            { name: "French Toast", quantity: "2 slices", calories: 240, protein: 12, carbs: 30, fat: 8 },
            { name: "Mixed Berries", quantity: "120g", calories: 60, protein: 1.2, carbs: 14, fat: 0.5 },
            { name: "Low Fat Milk", quantity: "150ml", calories: 68, protein: 6.5, carbs: 9, fat: 1.5 },
          ],
        },
        {
          type: "lunch",
          time: "1:30 PM",
          totalCalories: 520,
          totalProtein: 32,
          totalCarbs: 52,
          totalFat: 18,
          items: [
            { name: "Veggie Buddha Bowl", quantity: "1 large", calories: 520, protein: 18, carbs: 64, fat: 22 },
          ],
        },
        {
          type: "snack",
          time: "4:30 PM",
          totalCalories: 190,
          totalProtein: 12,
          totalCarbs: 22,
          totalFat: 5,
          items: [
            { name: "Fruit & Nut Mix", quantity: "40g", calories: 190, protein: 4, carbs: 22, fat: 10 },
          ],
        },
        {
          type: "dinner",
          time: "7:00 PM",
          totalCalories: 480,
          totalProtein: 35,
          totalCarbs: 46,
          totalFat: 14,
          items: [
            { name: "Roast Chicken Leg", quantity: "200g", calories: 280, protein: 36, carbs: 0, fat: 14 },
            { name: "Roasted Potatoes", quantity: "150g", calories: 140, protein: 3, carbs: 32, fat: 2 },
            { name: "Steamed Carrots & Peas", quantity: "150g", calories: 80, protein: 4, carbs: 15, fat: 0.5 },
          ],
        },
      ],
      workout: null,
    },
  ],
};

// ─── Today's Logs (mock: partial logging for Wed/today) ────────────────────────

export const todayLogs: Record<string, DayLog> = {
  "2025-06-16": {
    date: "2025-06-16",
    meals: {
      breakfast: { mealType: "breakfast", followed: true, note: "" },
      "snack-1": { mealType: "snack", followed: true, note: "" },
      lunch: { mealType: "lunch", followed: false, note: "Had a chicken sandwich instead, roughly 480 cal", actualCalories: 480 },
      "snack-2": { mealType: "snack", followed: true, note: "" },
      dinner: { mealType: "dinner", followed: true, note: "" },
    },
    workout: { status: "completed", note: "Felt strong. Increased bench to 80kg.", completedExercises: ["Barbell Bench Press", "Incline Dumbbell Press", "Seated Cable Row", "Lat Pulldown", "Overhead Press", "Tricep Dips", "Bicep Curl"] },
  },
  "2025-06-17": {
    date: "2025-06-17",
    meals: {
      breakfast: { mealType: "breakfast", followed: true, note: "" },
      "snack-1": { mealType: "snack", followed: true, note: "" },
      lunch: { mealType: "lunch", followed: true, note: "" },
      "snack-2": { mealType: "snack", followed: true, note: "" },
      dinner: { mealType: "dinner", followed: false, note: "Ordered pizza — logged as off-plan", actualCalories: 820 },
    },
    workout: { status: "completed", note: "8 sprint intervals done. Legs are burning.", completedExercises: ["Warm Up Jog", "Sprint Intervals", "Jump Squats", "Burpees", "Mountain Climbers", "Cool Down Walk"] },
  },
  "2025-06-18": {
    date: "2025-06-18",
    meals: {
      breakfast: { mealType: "breakfast", followed: true, note: "" },
      "snack-1": { mealType: "snack", followed: true, note: "" },
      lunch: { mealType: "lunch", followed: false, note: "", actualCalories: undefined },
      "snack-2": { mealType: "snack", followed: false, note: "", actualCalories: undefined },
      dinner: { mealType: "dinner", followed: false, note: "", actualCalories: undefined },
    },
    workout: null,
  },
};