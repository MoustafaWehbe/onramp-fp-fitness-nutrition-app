import { z } from "zod";

/**
 * Editable coach profile fields, allowlisted.
 *
 * `userId`, `rating` and `clientsCount` are declared model attributes, so
 * handing `req.body` to `update()` would let a coach set their own rating or
 * reassign the profile to another user. TypeScript's `Omit` does not survive
 * to runtime; this does.
 */
export const upsertCoachProfileSchema = z.object({
  title: z.string().trim().min(2).max(120).nullish(),
  bio: z.string().trim().max(2_000).nullish(),
  gender: z.enum(["male", "female"]).nullish(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD")
    .nullish(),
  specialties: z.array(z.string().trim().min(1).max(60)).max(20).nullish(),
  yearsExperience: z.number().int().min(0).max(80).nullish(),
  certifications: z.array(z.string().trim().min(1).max(120)).max(20).nullish(),
  avatarUrl: z.string().url().max(2_000).nullish(),
});

export const createCoachRequestSchema = z.object({
  coachId: z.string().uuid("A coach must be selected"),
  message: z.string().trim().max(1_000).optional(),
});

export const coachRequestIdSchema = z.object({
  coachRequestId: z.string().uuid(),
});

export type UpsertCoachProfileInput = z.infer<typeof upsertCoachProfileSchema>;
