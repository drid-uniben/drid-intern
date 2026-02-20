import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import { invitationRepository, notificationRepository, submissionRepository, userRepository } from "../common/repositories";
import { createSubmissionSchema, listSubmissionsQuerySchema } from "./submissions.schemas";

export const submissionsRouter = Router();

submissionsRouter.post("/", validateBody(createSubmissionSchema), async (req, res) => {
  const invitation = await invitationRepository.findByToken(req.body.invitationToken);
  if (!invitation) {
    res.status(404).json({ success: false, error: "Invitation not found" });
    return;
  }

  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    res.status(400).json({ success: false, error: "Invitation expired" });
    return;
  }

  if (await submissionRepository.findByInvitationId(invitation.id)) {
    res.status(409).json({ success: false, error: "Submission already exists for this invitation" });
    return;
  }

  const submission = await submissionRepository.create({
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
  await invitationRepository.update(invitation);

  const users = await userRepository.list();
  await Promise.all(
    users.filter((user) => user.role === "ADMIN" || user.role === "REVIEWER").map((user) =>
      notificationRepository.create({
        userId: user.id,
        title: "New submission",
        message: `${submission.fullName} submitted a ${submission.category} challenge`,
        type: "NEW_SUBMISSION",
      }),
    ),
  );

  res.status(201).json({ success: true, data: submission });
});

submissionsRouter.get("/:submissionId", authenticate, async (req, res) => {
  const submission = await submissionRepository.findById(req.params.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  res.json({ success: true, data: submission });
});

submissionsRouter.get("/", authenticate, authorize("ADMIN", "REVIEWER"), validateQuery(listSubmissionsQuerySchema), async (req, res) => {
  let submissions = await submissionRepository.list();

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

submissionsRouter.patch("/:submissionId/accept", authenticate, authorize("ADMIN"), async (req, res) => {
  const submission = await submissionRepository.findById(req.params.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  submission.status = "accepted";
  await submissionRepository.update(submission);
  res.json({ success: true, data: submission });
});

submissionsRouter.patch("/:submissionId/reject", authenticate, authorize("ADMIN"), async (req, res) => {
  const submission = await submissionRepository.findById(req.params.submissionId);
  if (!submission) {
    res.status(404).json({ success: false, error: "Submission not found" });
    return;
  }

  submission.status = "rejected";
  await submissionRepository.update(submission);
  res.json({ success: true, data: submission });
});
