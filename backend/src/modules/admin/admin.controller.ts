import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize, AuthenticatedRequest } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import {
  adminStatsRepository,
  auditRepository,
  cohortRepository,
  outboundEmailRepository,
  submissionRepository,
  userRepository,
} from "../common/repositories";
import { emailService } from "../../services/email.service";

const submissionStatusSchema = z.enum(["submitted", "under_review", "accepted", "rejected"]);

const emailAudienceQuerySchema = z.object({
  cohortId: z.string().uuid().optional(),
  status: submissionStatusSchema.optional(),
  category: z.string().trim().min(2).max(50).optional(),
});

const sendBulkEmailSchema = emailAudienceQuerySchema.extend({
  cohortId: z.string().uuid(),
  subject: z.string().trim().min(3).max(160),
  html: z.string().trim().min(1),
});

const buildAudience = async (filters: { cohortId: string; status?: "submitted" | "under_review" | "accepted" | "rejected"; category?: string }) => {
  const submissions = await submissionRepository.listForAudience(filters);
  const unique = new Map<string, {
    submissionId: string;
    fullName: string;
    email: string;
    category: string;
    status: "submitted" | "under_review" | "accepted" | "rejected";
  }>();

  for (const submission of submissions) {
    const key = submission.email.toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, {
        submissionId: submission.id,
        fullName: submission.fullName,
        email: submission.email,
        category: submission.category,
        status: submission.status,
      });
    }
  }

  return Array.from(unique.values());
};

export const adminRouter = Router();

adminRouter.get("/stats", authenticate, authorize("ADMIN"), async (_req, res) => {
  const stats = await adminStatsRepository.getStats();

  res.json({ success: true, data: stats });
});

adminRouter.get("/audit-logs", authenticate, authorize("ADMIN"), async (_req, res) => {
  res.json({ success: true, data: await auditRepository.list() });
});

adminRouter.get(
  "/email-campaigns/audience",
  authenticate,
  authorize("ADMIN"),
  validateQuery(emailAudienceQuerySchema),
  async (req, res) => {
    const cohortId = typeof req.query.cohortId === "string" ? req.query.cohortId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status as "submitted" | "under_review" | "accepted" | "rejected" : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;

    if (!cohortId) {
      res.status(400).json({ success: false, error: "cohortId is required for audience preview" });
      return;
    }

    const cohort = await cohortRepository.findById(cohortId);
    if (!cohort) {
      res.status(404).json({ success: false, error: "Cohort not found" });
      return;
    }

    const recipients = await buildAudience({ cohortId, status, category });

    res.json({
      success: true,
      data: {
        count: recipients.length,
        recipients,
      },
    });
  },
);

adminRouter.post(
  "/email-campaigns/send",
  authenticate,
  authorize("ADMIN"),
  validateBody(sendBulkEmailSchema),
  async (req: AuthenticatedRequest, res) => {
    const cohort = await cohortRepository.findById(req.body.cohortId);
    if (!cohort) {
      res.status(404).json({ success: false, error: "Cohort not found" });
      return;
    }

    const recipients = await buildAudience({
      cohortId: req.body.cohortId,
      status: req.body.status,
      category: req.body.category,
    });

    if (recipients.length === 0) {
      res.status(400).json({ success: false, error: "No recipients match the selected filters" });
      return;
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      try {
        await emailService.sendHtml({
          to: recipient.email,
          subject: req.body.subject,
          html: req.body.html,
        });
        sentCount += 1;
      } catch {
        failedCount += 1;
      }
    }

    const record = await outboundEmailRepository.create({
      cohortId: req.body.cohortId,
      sentByUserId: req.auth!.userId,
      subject: req.body.subject,
      htmlBody: req.body.html,
      filters: {
        cohortId: req.body.cohortId,
        status: req.body.status ?? null,
        category: req.body.category ?? null,
      },
      recipients,
      attemptedCount: recipients.length,
      sentCount,
      failedCount,
    });

    res.json({ success: true, data: record });
  },
);

adminRouter.get(
  "/email-campaigns",
  authenticate,
  authorize("ADMIN"),
  validateQuery(z.object({ cohortId: z.string().uuid().optional() })),
  async (req, res) => {
    const cohortId = typeof req.query.cohortId === "string" ? req.query.cohortId : undefined;
    const campaigns = await outboundEmailRepository.list({ cohortId });

    const cohortCache = new Map<string, string>();
    const senderCache = new Map<string, string>();

    const data = await Promise.all(campaigns.map(async (item) => {
      let cohortLabel = "All cohorts";
      if (item.cohortId) {
        if (!cohortCache.has(item.cohortId)) {
          const cohort = await cohortRepository.findById(item.cohortId);
          cohortCache.set(item.cohortId, cohort ? `${cohort.year} Cohort ${cohort.cohortNumber}` : "Unknown cohort");
        }
        cohortLabel = cohortCache.get(item.cohortId) ?? "Unknown cohort";
      }

      if (!senderCache.has(item.sentByUserId)) {
        const sender = await userRepository.findById(item.sentByUserId);
        senderCache.set(item.sentByUserId, sender ? `${sender.fullName} (${sender.email})` : "Unknown sender");
      }

      return {
        ...item,
        cohortLabel,
        senderLabel: senderCache.get(item.sentByUserId) ?? "Unknown sender",
      };
    }));

    res.json({ success: true, data });
  },
);
