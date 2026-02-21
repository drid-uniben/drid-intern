import { z } from "zod";

export const createCohortSchema = z.object({
  year: z.number().int().min(2020),
  cohortNumber: z.number().int().positive(),
  deadlineAt: z.string().datetime(),
  allowedCategories: z.array(z.string().trim().min(2).max(50)).min(1),
});

export const updateStatusSchema = z.object({
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "ACTIVE", "CLOSED", "ARCHIVED"]),
});

export const updateCohortSchema = z.object({
  year: z.number().int().min(2020).optional(),
  cohortNumber: z.number().int().positive().optional(),
  deadlineAt: z.string().datetime().optional(),
  allowedCategories: z.array(z.string().trim().min(2).max(50)).min(1).optional(),
});
