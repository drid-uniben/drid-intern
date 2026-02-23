import { z } from "zod";

export const createReviewSchema = z.object({
  submissionId: z.string().uuid(),
  rating: z.number().min(0).max(10).optional(),
  criteriaScores: z.array(
    z.object({
      label: z.string(),
      score: z.number().min(1).max(10),
      comment: z.string().optional(),
    })
  ).optional(),
  recommendation: z.enum(["RECOMMEND", "NEUTRAL", "DO_NOT_RECOMMEND"]).optional(),
  comment: z.string().max(1000).default(""),
});
