import { Router } from "express";
import { authenticate, authorize, AuthenticatedRequest } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { notificationRepository, reviewRepository, submissionRepository } from "../common/repositories";
import { createReviewSchema } from "./reviews.schemas";

export const reviewsRouter = Router();

reviewsRouter.post("/", authenticate, authorize("REVIEWER", "ADMIN"), validateBody(createReviewSchema), (req: AuthenticatedRequest, res) => {
  const submission = submissionRepository.findById(req.body.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  const review = reviewRepository.create({
    submissionId: req.body.submissionId,
    reviewerUserId: req.auth!.userId,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  const reviews = reviewRepository.listBySubmission(submission.id);
  const average = reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  submission.averageRating = Number(average.toFixed(2));
  submission.status = "under_review";
  submissionRepository.update(submission);

  notificationRepository.create({
    userId: req.auth!.userId,
    title: "Review added",
    message: `Review recorded for submission ${submission.id}`,
    type: "REVIEW_ADDED",
  });

  res.status(201).json({ success: true, data: review });
});

reviewsRouter.get("/submission/:submissionId", authenticate, authorize("ADMIN", "REVIEWER"), (req, res) => {
  const reviews = reviewRepository.listBySubmission(req.params.submissionId);
  res.json({ success: true, data: reviews });
});
