import { z } from "zod";

export const createReviewSchema = z.object({
  submissionId: z.string().uuid(),
  rating: z.number().int().min(1).max(10),
  comment: z.string().min(2).max(1000),
});
