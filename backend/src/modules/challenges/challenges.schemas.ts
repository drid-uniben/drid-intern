import { z } from "zod";

export const createChallengeSchema = z.object({
  cohortId: z.string().uuid(),
  category: z.enum(["backend", "frontend", "fullstack", "design"]),
  title: z.string().min(3),
  description: z.string().min(10),
});

export const updateChallengeSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
});
