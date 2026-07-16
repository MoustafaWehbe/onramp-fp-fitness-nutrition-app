import {
  DayPlan,
  Exercise,
  FitnessAiChatMessage,
  FitnessBodyMeasurement,
  Meal,
  MealItem,
  MealLog,
  Program,
  Workout,
  WorkoutLog,
} from "../models";
import { createError } from "../middleware/error-handler";

interface MeasurementInput {
  weight: number;
  waist: number;
  chest: number;
  hips: number;
}

interface MealTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyAggregate extends MealTotals {
  date: string;
  workoutCompleted: boolean;
  notes: string[];
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

function getDailyAggregate(
  dailyLogs: Map<string, DailyAggregate>,
  date: string,
): DailyAggregate {
  const existing = dailyLogs.get(date);
  if (existing) return existing;

  const aggregate: DailyAggregate = {
    date,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    workoutCompleted: false,
    notes: [],
  };
  dailyLogs.set(date, aggregate);
  return aggregate;
}

function groupDailyNutrition(
  logs: DailyAggregate[],
  calorieTarget: number,
): Array<{ week: string; calories: number; target: number }> {
  const groups = new Map<string, number[]>();

  for (const log of logs) {
    const key = toDateKey(startOfWeek(new Date(log.date)));
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
  logs: DailyAggregate[],
  weeklyTarget: number,
): Array<{ week: string; completed: number; target: number }> {
  const groups = new Map<string, number>();

  for (const log of logs) {
    const key = toDateKey(startOfWeek(new Date(log.date)));
    groups.set(key, (groups.get(key) ?? 0) + (log.workoutCompleted ? 1 : 0));
  }

  return Array.from(groups.entries())
    .slice(-4)
    .map(([week, completed]) => ({
      week: formatDateLabel(week),
      completed,
      target: weeklyTarget,
    }));
}

function estimateProteinTarget(program: Program): number {
  return Math.round((program.calories * 0.3) / 4);
}

function mealTotalsFromLog(mealLog: MealLog, meal: Meal): MealTotals {
  if (mealLog.status === "skipped" || mealLog.status === "pending") {
    return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  }

  const calories = mealLog.actualCalories ?? meal.totalCalories;
  const scale =
    mealLog.actualCalories && meal.totalCalories > 0
      ? mealLog.actualCalories / meal.totalCalories
      : 1;

  return {
    calories,
    protein: Math.round(meal.totalProtein * scale),
    carbs: Math.round(meal.totalCarbs * scale),
    fat: Math.round(meal.totalFat * scale),
  };
}

function addTotals(target: MealTotals, source: MealTotals): void {
  target.calories += source.calories;
  target.protein += source.protein;
  target.carbs += source.carbs;
  target.fat += source.fat;
}

type MealLogWithMeal = MealLog & {
  meal?: Meal & { dayPlan?: DayPlan };
};

type WorkoutLogWithWorkout = WorkoutLog & {
  workout?: Workout & { dayPlan?: DayPlan };
};

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
  };
};

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

interface OpenRouterErrorPayload {
  error?: {
    message?: string;
    code?: string | number;
    type?: string;
  };
  message?: string;
  code?: string | number;
  type?: string;
}

function sanitizeProviderText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/sk-or-v1-[A-Za-z0-9_-]+/g, "[redacted-openrouter-key]")
    .slice(0, 360);
}

function describeNetworkFailure(error: unknown): string {
  const record = error as {
    name?: string;
    message?: string;
    code?: string;
    cause?: { code?: string; message?: string };
  };
  const code = record.cause?.code ?? record.code ?? record.name ?? "unknown";
  const rawMessage = sanitizeProviderText(record.cause?.message ?? record.message);

  if (record.name === "AbortError") {
    return "OpenRouter request timed out after 20 seconds.";
  }
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return `OpenRouter DNS lookup failed (code ${code}).`;
  }
  if (code === "ECONNREFUSED" || code === "ECONNRESET") {
    return `OpenRouter HTTPS connection failed (code ${code}).`;
  }
  if (code === "ETIMEDOUT") {
    return "OpenRouter HTTPS connection timed out.";
  }
  if (code === "EACCES" || code === "EPERM") {
    return `OpenRouter HTTPS request was blocked by the environment (code ${code}).`;
  }
  if (String(code).includes("CERT") || rawMessage.toLowerCase().includes("certificate")) {
    return `OpenRouter TLS validation failed (code ${code}).`;
  }

  return `OpenRouter network request failed (code ${code}${rawMessage ? `, ${rawMessage}` : ""}).`;
}

async function readOpenRouterError(response: Response): Promise<string> {
  const raw = await response.text();
  let payload: OpenRouterErrorPayload | null = null;

  try {
    payload = raw ? (JSON.parse(raw) as OpenRouterErrorPayload) : null;
  } catch {
    payload = null;
  }

  const providerError = payload?.error;
  const code = providerError?.code ?? payload?.code ?? "none";
  const type = providerError?.type ?? payload?.type ?? "none";
  const message =
    sanitizeProviderText(providerError?.message) ||
    sanitizeProviderText(payload?.message) ||
    sanitizeProviderText(raw) ||
    "No provider message returned";

  let action = "Please try again shortly.";
  if (response.status === 401 || response.status === 403) {
    action =
      "The configured API key was rejected or lacks permission; rotate OPENROUTER_API_KEY locally and restart the API.";
  } else if (response.status === 402) {
    action = "The OpenRouter account appears to need credits or billing access.";
  } else if (response.status === 404) {
    action = "The configured OpenRouter model or provider is unavailable.";
  } else if (response.status === 408 || response.status === 504) {
    action = "The provider timed out; retry or choose another available model.";
  } else if (response.status === 429) {
    action = "The OpenRouter account is currently rate limited.";
  } else if (response.status >= 500) {
    action = "OpenRouter or the selected model provider returned a server error.";
  }

  return `OpenRouter request failed (status ${response.status}, code ${code}, type ${type}): ${message}. ${action}`;
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
    "Use the active program, workout plan, meal plan, saved progress logs, body measurements, and chat history.",
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
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
  } catch (error) {
    throw createError(describeNetworkFailure(error), 503);
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw createError(
      await readOpenRouterError(response),
      response.status === 401 || response.status === 403 ? 502 : 503,
    );
  }

  const payload = (await response.json()) as OpenRouterChatResponse;
  const answer = payload.choices?.[0]?.message?.content?.trim();

  if (!answer) {
    throw createError("OpenRouter returned an empty assistant response.", 502);
  }

  return answer;
}

export class FitnessService {
  async getActiveProgram(userId: string): Promise<Program> {
    const program = await Program.findOne({
      where: { userId },
      order: [["updatedAt", "DESC"]],
    });

    if (!program) throw createError("No active program found", 404);
    return program;
  }

  async getSummary(userId: string) {
    const program = await this.getActiveProgram(userId);

    const [dayPlans, mealLogs, workoutLogs, measurements, chatMessages] =
      await Promise.all([
        DayPlan.findAll({
          where: { programId: program.id },
          order: [["dayNumber", "ASC"]],
        }),
        MealLog.findAll({
          where: { userId },
          order: [["updatedAt", "ASC"]],
          include: [
            {
              model: Meal,
              as: "meal",
              include: [
                {
                  model: DayPlan,
                  as: "dayPlan",
                  where: { programId: program.id },
                },
              ],
            },
          ],
        }),
        WorkoutLog.findAll({
          where: { userId },
          order: [["updatedAt", "ASC"]],
          include: [
            {
              model: Workout,
              as: "workout",
              include: [
                {
                  model: DayPlan,
                  as: "dayPlan",
                  where: { programId: program.id },
                },
              ],
            },
          ],
        }),
        FitnessBodyMeasurement.findAll({
          where: { userId },
          order: [["measuredOn", "ASC"]],
          limit: 12,
        }),
        FitnessAiChatMessage.findAll({
          where: { userId, programId: program.id },
          order: [["createdAt", "ASC"]],
          limit: 30,
        }),
      ]);

    const dailyLogMap = new Map<string, DailyAggregate>();
    const mealHistory = (mealLogs as MealLogWithMeal[]).flatMap((mealLog) => {
      const meal = mealLog.meal;
      const dayPlan = meal?.dayPlan;
      if (!meal || !dayPlan) return [];

      const totals = mealTotalsFromLog(mealLog, meal);
      const date = toDateKey(dayPlan.date);
      const aggregate = getDailyAggregate(dailyLogMap, date);
      addTotals(aggregate, totals);
      if (mealLog.note) aggregate.notes.push(mealLog.note);

      return [
        {
          date,
          mealType: meal.type,
          calories: totals.calories,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          status: mealLog.status,
          note: mealLog.note ?? "",
        },
      ];
    });

    for (const workoutLog of workoutLogs as WorkoutLogWithWorkout[]) {
      const dayPlan = workoutLog.workout?.dayPlan;
      if (!dayPlan) continue;

      const aggregate = getDailyAggregate(dailyLogMap, toDateKey(dayPlan.date));
      aggregate.workoutCompleted =
        aggregate.workoutCompleted || workoutLog.status === "completed";
      if (workoutLog.note) aggregate.notes.push(workoutLog.note);
    }

    const dailyLogs = Array.from(dailyLogMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
    const latestLog = dailyLogs[dailyLogs.length - 1];
    const proteinTarget = estimateProteinTarget(program);
    const workoutTargetPerWeek =
      dayPlans.filter((dayPlan) => !dayPlan.isRestDay).length || 0;
    const macroBreakdown = latestLog
      ? [
          { label: "Protein", grams: latestLog.protein, color: "#2563eb" },
          { label: "Carbs", grams: latestLog.carbs, color: "#16a34a" },
          { label: "Fat", grams: latestLog.fat, color: "#f97316" },
        ]
      : [];

    return {
      activePlan: {
        id: program.id,
        name: program.title,
        focus: program.goal,
        calorieTarget: program.calories,
        proteinTarget,
        workoutTargetPerWeek,
      },
      dailyLogs: dailyLogs.map((log) => ({
        date: log.date,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        workoutCompleted: log.workoutCompleted,
        note: log.notes.join(" "),
      })),
      weeklyNutrition: groupDailyNutrition(dailyLogs, program.calories),
      weeklyWorkoutCompletion: groupWorkoutCompletion(
        dailyLogs,
        workoutTargetPerWeek,
      ),
      macroBreakdown,
      measurements: measurements.map((measurement) => ({
        date: formatDateLabel(measurement.measuredOn),
        weight: Number(measurement.weight),
        waist: Number(measurement.waist),
        chest: Number(measurement.chest),
        hips: Number(measurement.hips),
      })),
      mealHistory,
      chatMessages: chatMessages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt?.toISOString(),
      })),
    };
  }

  async getCoachingContext(userId: string): Promise<CoachingContext> {
    const summary = await this.getSummary(userId);
    const program = await this.getActiveProgram(userId);
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
          const workout = (dayPlan as unknown as {
            workout?: Workout & { exercises?: Exercise[] };
          }).workout;

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
    const program = await this.getActiveProgram(userId);
    const answer = await requestOpenRouterAnswer(question, context);

    const [userMessage, assistantMessage] = await Promise.all([
      FitnessAiChatMessage.create({
        userId,
        programId: program.id,
        role: "user",
        content: question,
      }),
      FitnessAiChatMessage.create({
        userId,
        programId: program.id,
        role: "assistant",
        content: answer,
      }),
    ]);

    return [
      {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt?.toISOString(),
      },
      {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt?.toISOString(),
      },
    ];
  }
}

export const fitnessService = new FitnessService();
