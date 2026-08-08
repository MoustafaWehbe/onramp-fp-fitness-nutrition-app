import { z } from "zod";

export const upsertUserProfileSchema = z.object({
  age: z.number().int().min(13).max(100),
  gender: z.enum(["male", "female"]),
  heightCm: z.number().min(50).max(272),
  weightKg: z.number().min(20).max(400),
  targetWeightKg: z.number().min(20).max(400).nullish(),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
  goal: z.enum(["lose_weight", "gain_muscle", "maintain", "improve_endurance", "general_health"]),
  injuries: z.string().trim().max(1_000).nullish(),
  dietaryNotes: z.string().trim().max(1_000).nullish(),
});

export type UpsertUserProfileInput = z.infer<typeof upsertUserProfileSchema>;