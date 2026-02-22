import { z } from "zod";

export const createSubmissionSchema = z.object({
  invitationToken: z.string().min(10).optional(),
  category: z.string().trim().min(2).max(50).optional(),
  fullName: z.string().min(2),
  email: z.string().email(),
  repoUrl: z.string().url().optional(),
  liveLink: z.string().url().optional(),
  designLinks: z.string().max(2000).optional(),
  message: z.string().max(2000).default(""),
}).superRefine((data, ctx) => {
  if (!data.invitationToken && !data.category) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Either invitationToken or category is required",
      path: ["category"],
    });
  }
});

export const listSubmissionsQuerySchema = z.object({
  cohort: z.string().uuid().optional(),
  category: z.string().trim().min(2).max(50).optional(),
  status: z.enum(["submitted", "under_review", "accepted", "rejected"]).optional(),
  search: z.string().optional(),
});

export const bulkAssignSchema = z.object({
  submissionIds: z.array(z.string().uuid()).min(1),
  reviewerId: z.string().uuid(),
});

const submissionRequirementsSchema = z.object({
  category: z.string().trim().min(2).max(50),
  repoUrl: z.string().url().optional(),
  liveLink: z.string().url().optional(),
  designLinks: z.string().optional(),
}).superRefine((data, ctx) => {
  const isDesign = data.category.toLowerCase().includes("design");

  if (isDesign && !data.designLinks) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Design link (e.g. Figma URL) is required for design submissions",
      path: ["designLinks"],
    });
  }

  if (!isDesign && (!data.repoUrl || !data.liveLink)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Repository URL and Live Deployment URL are required for this challenge",
      path: ["repoUrl"],
    });
  }
});

export const validateSubmissionRequirements = (payload: {
  category: string;
  repoUrl?: string;
  liveLink?: string;
  designLinks?: string;
}): string | null => {
  const result = submissionRequirementsSchema.safeParse(payload);
  if (result.success) {
    return null;
  }

  return result.error.issues[0]?.message ?? "Invalid submission payload";
};
