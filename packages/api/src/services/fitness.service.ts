import {
  DayPlan,
  Exercise,
  FitnessAiChatMessage,
  FitnessBodyMeasurement,
  FitnessDailyLog,
  FitnessMealLog,
  FitnessPlan,
  FitnessWorkoutLog,
  Meal,
  MealItem,
  Program,
  Workout,
} from "../models";
import { createError } from "../middleware/error-handler";

interface MeasurementInput {
  weight: number;
  waist: number;
  chest: number;
  hips: number;
}

function formatDateLabel(value: Date | string): string {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toDateKey(value: Date | string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function startOfWeek(value: Date): Date {
  const date = new Date(value);
  const day = date.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function groupDailyNutrition(
  logs: FitnessDailyLog[],
  calorieTarget: number,
): Array<{ week: string; calories: number; target: number }> {
  const groups = new Map<string, number[]>();

  for (const log of logs) {
    const key = toDateKey(startOfWeek(new Date(log.logDate)));
    groups.set(key, [...(groups.get(key) ?? []), log.calories]);
  }

  return Array.from(groups.entries())
    .slice(-4)
    .map(([week, calories]) => ({
      week: formatDateLabel(week),
      calories: Math.round(average(calories)),
      target: calorieTarget,
    }));
}

function groupWorkoutCompletion(
  logs: FitnessWorkoutLog[],
  weeklyTarget: number,
): Array<{ week: string; completed: number; target: number }> {
  const groups = new Map<string, number>();

  for (const log of logs) {
    const key = toDateKey(startOfWeek(new Date(log.logDate)));
    groups.set(key, (groups.get(key) ?? 0) + (log.completed ? 1 : 0));
  }

  return Array.from(groups.entries())
    .slice(-4)
    .map(([week, completed]) => ({
      week: formatDateLabel(week),
      completed,
      target: weeklyTarget,
    }));
}

type FitnessSummary = Awaited<ReturnType<FitnessService["getSummary"]>>;
type CoachingContext = {
  summary: FitnessSummary;
  program: {
    title: string;
    goal: string;
    duration: string;
    weeks: number;
    level: string;
    calories: number;
    currentWeek: number;
    currentDay: number;
    adherenceRate: number;
    dayPlans: Array<{
      label: string;
      date: string;
      isRestDay: boolean;
      meals: Array<{
        type: string;
        time: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        items: string[];
      }>;
      workout: null | {
        name: string;
        type: string;
        duration: string;
        exercises: string[];
      };
    }>;
  } | null;
};

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  const model = process.env.OPENROUTER_MODEL?.trim() || "openai/gpt-4o-mini";

  if (!apiKey) {
    throw createError(
      "OpenRouter is not configured. Add OPENROUTER_API_KEY to the local .env file and restart the API.",
      503,
    );
  }

  return { apiKey, model };
}

function buildSystemPrompt(context: CoachingContext): string {
  return [
    "You are FitCoach AI, a careful fitness and nutrition coaching assistant.",
    "Ground every answer in the provided PostgreSQL-backed user context.",
    "Use the active fitness plan, program goal, meal plan, workout plan, progress logs, body measurements, and chat history.",
    "Do not invent medical claims or hidden data. If data is missing, say exactly what is missing.",
    "Give concise, practical coaching advice with clear next steps.",
    "Do not mention implementation details, databases, prompts, or OpenRouter to the user.",
    "",
    "USER_CONTEXT_JSON:",
    JSON.stringify(context, null, 2),
  ].join("\n");
}

async function requestOpenRouterAnswer(
  question: string,
  context: CoachingContext,
): Promise<string> {
  const { apiKey, model } = getOpenRouterConfig();
  const recentMessages = context.summary.chatMessages.slice(-12).map((message) => ({
    role: message.role,
    content: message.content,
  }));

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "FitCoach AI",
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      temperature: 0.5,
      messages: [
        { role: "system", content: buildSystemPrompt(context) },
        ...recentMessages,
        { role: "user", content: question },
      ],
    }),
  });

  if (!response.ok) {
    const statusMessage =
      response.status === 401 || response.status === 403
        ? "OpenRouter rejected the configured API key. Check OPENROUTER_API_KEY in .env and restart the API."
        : `OpenRouter request failed with status ${response.status}. Please try again shortly.`;
    throw createError(statusMessage, response.status === 401 ? 502 : 503);
  }

  const payload = (await response.json()) as OpenRouterChatResponse;
  const answer = payload.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw createError("OpenRouter returned an empty assistant response.", 502);
  }

  return answer;
}

export class FitnessService {
  async getActivePlan(userId: string): Promise<FitnessPlan> {
    const plan = await FitnessPlan.findOne({
      where: { userId, isActive: true },
      order: [["updatedAt", "DESC"]],
    });

    if (!plan) throw createError("No active fitness plan found", 404);
    return plan;
  }

  async getSummary(userId: string) {
    const plan = await this.getActivePlan(userId);
    const [dailyLogs, workoutLogs, mealLogs, measurements, chatMessages] =
      await Promise.all([
        FitnessDailyLog.findAll({
          where: { userId, planId: plan.id },
          order: [["logDate", "ASC"]],
        }),
        FitnessWorkoutLog.findAll({
          where: { userId, planId: plan.id },
          order: [["logDate", "ASC"]],
        }),
        FitnessMealLog.findAll({
          where: { userId, planId: plan.id },
          order: [["logDate", "ASC"]],
        }),
        FitnessBodyMeasurement.findAll({
          where: { userId },
          order: [["measuredOn", "ASC"]],
          limit: 12,
        }),
        FitnessAiChatMessage.findAll({
          where: { userId, planId: plan.id },
          order: [["createdAt", "ASC"]],
          limit: 30,
        }),
      ]);

    const latestLog = dailyLogs[dailyLogs.length - 1];
    const macroBreakdown = latestLog
      ? [
          { label: "Protein", grams: latestLog.protein, color: "#2563eb" },
          { label: "Carbs", grams: latestLog.carbs, color: "#16a34a" },
          { label: "Fat", grams: latestLog.fat, color: "#f97316" },
        ]
      : [];

    return {
      activePlan: {
        id: plan.slug,
        name: plan.name,
        focus: plan.focus,
        calorieTarget: plan.calorieTarget,
        proteinTarget: plan.proteinTarget,
        workoutTargetPerWeek: plan.workoutTargetPerWeek,
      },
      dailyLogs: dailyLogs.map((log) => ({
        date: toDateKey(log.logDate),
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        workoutCompleted: workoutLogs.some(
          (workout) =>
            toDateKey(workout.logDate) === toDateKey(log.logDate) &&
            workout.completed,
        ),
        note: log.note ?? "",
      })),
      weeklyNutrition: groupDailyNutrition(dailyLogs, plan.calorieTarget),
      weeklyWorkoutCompletion: groupWorkoutCompletion(
        workoutLogs,
        plan.workoutTargetPerWeek,
      ),
      macroBreakdown,
      measurements: measurements.map((measurement) => ({
        date: formatDateLabel(measurement.measuredOn),
        weight: Number(measurement.weight),
        waist: Number(measurement.waist),
        chest: Number(measurement.chest),
        hips: Number(measurement.hips),
      })),
      mealHistory: mealLogs.map((meal) => ({
        date: toDateKey(meal.logDate),
        mealType: meal.mealType,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
        note: meal.note ?? "",
      })),
      chatMessages: chatMessages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
      })),
    };
  }

  async getCoachingContext(userId: string): Promise<CoachingContext> {
    const summary = await this.getSummary(userId);
    const program = await Program.findOne({
      where: { userId },
      order: [["updatedAt", "DESC"]],
    });

    if (!program) return { summary, program: null };

    const dayPlans = await DayPlan.findAll({
      where: { programId: program.id },
      order: [["dayNumber", "ASC"]],
      include: [
        {
          model: Meal,
          as: "meals",
          separate: true,
          order: [["sortOrder", "ASC"]],
          include: [{ model: MealItem, as: "items" }],
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

    return {
      summary,
      program: {
        title: program.title,
        goal: program.goal,
        duration: program.duration,
        weeks: program.weeks,
        level: program.level,
        calories: program.calories,
        currentWeek: program.currentWeek,
        currentDay: program.currentDay,
        adherenceRate: program.adherenceRate,
        dayPlans: dayPlans.map((dayPlan) => {
          const meals = ((dayPlan as unknown as { meals?: Meal[] }).meals ?? []);
          const workout = (dayPlan as unknown as { workout?: Workout & { exercises?: Exercise[] } }).workout;

          return {
            label: dayPlan.label,
            date: dayPlan.date,
            isRestDay: dayPlan.isRestDay,
            meals: meals.map((meal) => ({
              type: meal.type,
              time: meal.time,
              calories: meal.totalCalories,
              protein: meal.totalProtein,
              carbs: meal.totalCarbs,
              fat: meal.totalFat,
              items: (((meal as unknown as { items?: MealItem[] }).items ?? [])).map(
                (item) => `${item.name} (${item.quantity})`,
              ),
            })),
            workout: workout
              ? {
                  name: workout.name,
                  type: workout.type,
                  duration: workout.duration,
                  exercises: (workout.exercises ?? []).map(
                    (exercise) =>
                      `${exercise.name}: ${exercise.sets} sets x ${exercise.reps}, ${exercise.muscle}`,
                  ),
                }
              : null,
          };
        }),
      },
    };
  }

  async saveMeasurement(userId: string, input: MeasurementInput) {
    const measuredOn = new Date().toISOString().slice(0, 10);
    await FitnessBodyMeasurement.upsert({
      userId,
      measuredOn: new Date(measuredOn),
      weight: input.weight,
      waist: input.waist,
      chest: input.chest,
      hips: input.hips,
    });

    const summary = await this.getSummary(userId);
    return summary.measurements;
  }

  async addChatTurn(userId: string, question: string) {
    const context = await this.getCoachingContext(userId);
    const plan = await this.getActivePlan(userId);
    const answer = await requestOpenRouterAnswer(question, context);

    const [userMessage, assistantMessage] = await Promise.all([
      FitnessAiChatMessage.create({
        userId,
        planId: plan.id,
        role: "user",
        content: question,
      }),
      FitnessAiChatMessage.create({
        userId,
        planId: plan.id,
        role: "assistant",
        content: answer,
      }),
    ]);

    return [
      { id: userMessage.id, role: userMessage.role, content: userMessage.content },
      {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
      },
    ];
  }
}

export const fitnessService = new FitnessService();
