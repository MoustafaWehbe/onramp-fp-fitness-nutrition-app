import { z } from "zod";

export const saveMeasurementSchema = z.object({
  weight: z.number().positive(),
  waist: z.number().positive(),
  chest: z.number().positive(),
  hips: z.number().positive(),
});

export const sendFitnessChatSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
});
