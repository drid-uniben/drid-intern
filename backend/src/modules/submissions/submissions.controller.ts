import { Router } from "express";
import { authenticate, authorize, AuthenticatedRequest } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import { bulkAssignSchema, createSubmissionSchema, listSubmissionsQuerySchema } from "./submissions.schemas";
import { assignReviewerToSubmissions, createSubmission, getSubmissionById, listSubmissions, updateSubmissionStatus } from "./submissions.usecases";

export const submissionsRouter = Router();

submissionsRouter.post("/", validateBody(createSubmissionSchema), async (req, res, next) => {
  try {
    const submission = await createSubmission(req.body);
    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create submission";

    if (message === "Invitation not found" || message === "No active cohort") {
      res.status(404).json({ success: false, error: message });
      return;
    }

    if (message === "Submission already exists for this invitation") {
      res.status(409).json({ success: false, error: message });
      return;
    }

    if (
      message === "Invitation expired"
      || message === "Invalid challenge category"
      || message === "Figma URL is required for design submissions"
      || message === "GitHub URL and Deployment URL are required for this challenge"
    ) {
      res.status(400).json({ success: false, error: message });
      return;
    }

    next(error);
  }
});

submissionsRouter.get("/:submissionId", authenticate, async (req, res) => {
  const submission = await getSubmissionById(req.params.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  res.json({ success: true, data: submission });
});

submissionsRouter.get("/", authenticate, authorize("ADMIN", "REVIEWER"), validateQuery(listSubmissionsQuerySchema), async (req: AuthenticatedRequest, res) => {
  const submissions = await listSubmissions({
    cohort: typeof req.query.cohort === "string" ? req.query.cohort : undefined,
    category: typeof req.query.category === "string" ? req.query.category : undefined,
    status: typeof req.query.status === "string" ? req.query.status as "submitted" | "under_review" | "accepted" | "rejected" : undefined,
    search: typeof req.query.search === "string" ? req.query.search : undefined,
  });

  // Filter if it's a reviewer (they only see their assigned submissions unless explicitly requested otherwise, though per our design REVIEWERS only see theirs)
  let filteredSubmissions = submissions;
  if (req.auth?.role === "REVIEWER") {
    filteredSubmissions = submissions.filter((s) => s.assignedReviewerId === req.auth!.userId);
  }

  res.json({ success: true, data: filteredSubmissions });
});

submissionsRouter.post("/bulk-assign", authenticate, authorize("ADMIN"), validateBody(bulkAssignSchema), async (req, res, next) => {
  try {
    const { submissionIds, reviewerId } = req.body;
    const updatedSubmissions = await assignReviewerToSubmissions(submissionIds, reviewerId);
    res.json({ success: true, data: updatedSubmissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to assign reviewers";
    if (message === "Reviewer not found" || message === "User is not authorized to review submissions") {
      res.status(400).json({ success: false, error: message });
      return;
    }
    next(error);
  }
});

submissionsRouter.patch("/:submissionId/accept", authenticate, authorize("ADMIN"), async (req, res) => {
  const submission = await updateSubmissionStatus(req.params.submissionId, "accepted");
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  res.json({ success: true, data: submission });
});

submissionsRouter.patch("/:submissionId/reject", authenticate, authorize("ADMIN"), async (req, res) => {
  const submission = await updateSubmissionStatus(req.params.submissionId, "rejected");
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  res.json({ success: true, data: submission });
});
