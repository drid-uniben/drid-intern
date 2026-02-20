import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import { invitationRepository, notificationRepository, submissionRepository, userRepository } from "../common/repositories";
import { createSubmissionSchema, listSubmissionsQuerySchema } from "./submissions.schemas";

export const submissionsRouter = Router();

submissionsRouter.post("/", validateBody(createSubmissionSchema), (req, res) => {
  const invitation = invitationRepository.findByToken(req.body.invitationToken);
  if (!invitation) {
    res.status(404).json({ success: false, error: "Invitation not found" });
    return;
  }

  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    res.status(400).json({ success: false, error: "Invitation expired" });
    return;
  }

  if (submissionRepository.findByInvitationId(invitation.id)) {
    res.status(409).json({ success: false, error: "Submission already exists for this invitation" });
    return;
  }

  const submission = submissionRepository.create({
    cohortId: invitation.cohortId,
    invitationId: invitation.id,
    category: invitation.category,
    fullName: req.body.fullName,
    email: req.body.email,
    githubUrl: req.body.githubUrl ?? null,
    deploymentUrl: req.body.deploymentUrl ?? null,
    figmaUrl: req.body.figmaUrl ?? null,
    message: req.body.message,
    status: "submitted",
  });

  invitation.acceptedAt = new Date().toISOString();
  invitationRepository.update(invitation);

  userRepository.list().filter((user) => user.role === "ADMIN" || user.role === "REVIEWER").forEach((user) => {
    notificationRepository.create({
      userId: user.id,
      title: "New submission",
      message: `${submission.fullName} submitted a ${submission.category} challenge`,
      type: "NEW_SUBMISSION",
    });
  });

  res.status(201).json({ success: true, data: submission });
});

submissionsRouter.get("/:submissionId", authenticate, (req, res) => {
  const submission = submissionRepository.findById(req.params.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  res.json({ success: true, data: submission });
});

submissionsRouter.get("/", authenticate, authorize("ADMIN", "REVIEWER"), validateQuery(listSubmissionsQuerySchema), (req, res) => {
  let submissions = submissionRepository.list();

  if (req.query.cohort) {
    submissions = submissions.filter((item) => item.cohortId === req.query.cohort);
  }

  if (req.query.category) {
    submissions = submissions.filter((item) => item.category === req.query.category);
  }

  if (req.query.status) {
    submissions = submissions.filter((item) => item.status === req.query.status);
  }

  if (req.query.search) {
    const term = String(req.query.search).toLowerCase();
    submissions = submissions.filter((item) => item.email.toLowerCase().includes(term) || item.fullName.toLowerCase().includes(term));
  }

  res.json({ success: true, data: submissions });
});

submissionsRouter.patch("/:submissionId/accept", authenticate, authorize("ADMIN"), (req, res) => {
  const submission = submissionRepository.findById(req.params.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  submission.status = "accepted";
  submissionRepository.update(submission);
  res.json({ success: true, data: submission });
});

submissionsRouter.patch("/:submissionId/reject", authenticate, authorize("ADMIN"), (req, res) => {
  const submission = submissionRepository.findById(req.params.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  submission.status = "rejected";
  submissionRepository.update(submission);
  res.json({ success: true, data: submission });
});
