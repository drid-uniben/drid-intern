import { z } from "zod";

export const createInvitationsSchema = z.object({
  cohortId: z.string().uuid(),
  category: z.string().trim().min(2).max(50),
  emails: z.array(z.string().email()).min(1),
  expiresInDays: z.number().int().positive().max(30).default(7),
});
