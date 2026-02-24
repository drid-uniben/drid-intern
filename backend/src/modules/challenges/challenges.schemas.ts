import { z } from "zod";

const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;

const isSafeHttpUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const hasValidMarkdownLinks = (description: string): boolean => {
  const linkMatches = description.match(markdownLinkPattern);
  if (!linkMatches) {
    return true;
  }

  markdownLinkPattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = markdownLinkPattern.exec(description)) !== null) {
    const linkText = match[1]?.trim();
    const linkUrl = match[2]?.trim();
    if (!linkText || !linkUrl || !isSafeHttpUrl(linkUrl)) {
      return false;
    }
  }

  return true;
};

const challengeDescriptionSchema = z
  .string()
  .min(10)
  .refine(hasValidMarkdownLinks, {
    message: "Description contains invalid links. Use [text](https://example.com) with http/https URLs.",
  });

export const createChallengeSchema = z.object({
  cohortId: z.string().uuid(),
  category: z.string().trim().min(2).max(50),
  title: z.string().min(3),
  description: challengeDescriptionSchema,
});

export const updateChallengeSchema = z.object({
  title: z.string().min(3),
  description: challengeDescriptionSchema,
});

export const listChallengesQuerySchema = z.object({
  cohortId: z.string().uuid().optional(),
  category: z.string().trim().min(2).max(50).optional(),
});
