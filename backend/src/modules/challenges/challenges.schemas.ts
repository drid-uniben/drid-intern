import { z } from "zod";

export const createChallengeSchema = z.object({
  cohortId: z.string().uuid(),
  category: z.string().trim().min(2).max(50),
  title: z.string().min(3),
  description: z.string().min(10),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
});

export const listChallengesQuerySchema = z.object({
  cohortId: z.string().uuid().optional(),
  category: z.string().trim().min(2).max(50).optional(),
});
