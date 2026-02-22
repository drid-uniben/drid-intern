import { Router } from "express";
import { authenticate, authorize, AuthenticatedRequest } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { notificationRepository, reviewRepository, submissionRepository } from "../common/repositories";
import { createReviewSchema } from "./reviews.schemas";

export const reviewsRouter = Router();

reviewsRouter.post("/", authenticate, authorize("REVIEWER", "ADMIN"), validateBody(createReviewSchema), async (req: AuthenticatedRequest, res) => {
  const submission = await submissionRepository.findById(req.body.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  let finalRating = req.body.rating;

  if (req.body.criteriaScores && req.body.criteriaScores.length > 0) {
    const totalScore = req.body.criteriaScores.reduce((sum: number, criterion: any) => sum + criterion.score, 0);
    finalRating = Math.round(totalScore / req.body.criteriaScores.length);
  }

  const review = await reviewRepository.create({
    submissionId: req.body.submissionId,
    reviewerUserId: req.auth!.userId,
    rating: finalRating || 0,
    criteriaScores: req.body.criteriaScores || null,
    recommendation: req.body.recommendation || null,
    comment: req.body.comment,
  });

  const reviews = await reviewRepository.listBySubmission(submission.id);
  const average = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  submission.averageRating = Number(average.toFixed(2));
  submission.status = "under_review";
  await submissionRepository.update(submission);

  await notificationRepository.create({
    userId: req.auth!.userId,
    title: "Review added",
    message: `Review recorded for submission ${submission.id}`,
    type: "REVIEW_ADDED",
  });

  res.status(201).json({ success: true, data: review });
});

reviewsRouter.get("/submission/:submissionId", authenticate, authorize("ADMIN", "REVIEWER"), async (req, res) => {
  const reviews = await reviewRepository.listBySubmission(req.params.submissionId);
  res.json({ success: true, data: reviews });
});
