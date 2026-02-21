import { z } from "zod";

export const createSubmissionSchema = z.object({
  invitationToken: z.string().min(10),
  fullName: z.string().min(2),
  email: z.string().email(),
  githubUrl: z.string().url().optional(),
  deploymentUrl: z.string().url().optional(),
  figmaUrl: z.string().url().optional(),
  message: z.string().max(2000).default(""),
});

export const listSubmissionsQuerySchema = z.object({
  cohort: z.string().uuid().optional(),
  category: z.string().trim().min(2).max(50).optional(),
  status: z.enum(["submitted", "under_review", "accepted", "rejected"]).optional(),
  search: z.string().optional(),
});
