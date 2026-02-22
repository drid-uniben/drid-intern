import crypto from "crypto";
import { challengeRepository, cohortRepository, invitationRepository, notificationRepository, submissionRepository, userRepository } from "../common/repositories";
import { validateSubmissionRequirements } from "./submissions.schemas";
import { Submission } from "../../types/domain";

interface CreateSubmissionInput {
  invitationToken?: string;
  category?: string;
  fullName: string;
  email: string;
  githubUrl?: string;
  deploymentUrl?: string;
  figmaUrl?: string;
  message: string;
}

export const createSubmission = async (input: CreateSubmissionInput): Promise<Submission> => {
  let invitation = input.invitationToken ? await invitationRepository.findByToken(input.invitationToken) : undefined;

  if (input.invitationToken && !invitation) {
    throw new Error("Invitation not found");
  }

  if (!invitation) {
    const activeCohort = await cohortRepository.findActive();
    if (!activeCohort) {
      throw new Error("No active cohort");
    }

    const category = String(input.category ?? "").trim().toLowerCase();
    const challenges = await challengeRepository.listByCohort(activeCohort.id);
    const hasCategory = challenges.some((challenge) => challenge.category === category);

    if (!hasCategory) {
      throw new Error("Invalid challenge category");
    }

    invitation = await invitationRepository.create({
      email: input.email,
      cohortId: activeCohort.id,
      category,
      token: crypto.randomBytes(24).toString("hex"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }

  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    throw new Error("Invitation expired");
  }

  if (await submissionRepository.findByInvitationId(invitation.id)) {
    throw new Error("Submission already exists for this invitation");
  }

  const requirementsError = validateSubmissionRequirements({
    category: invitation.category,
    githubUrl: input.githubUrl,
    deploymentUrl: input.deploymentUrl,
    figmaUrl: input.figmaUrl,
  });

  if (requirementsError) {
    throw new Error(requirementsError);
  }

  const submission = await submissionRepository.create({
    cohortId: invitation.cohortId,
    invitationId: invitation.id,
    category: invitation.category,
    fullName: input.fullName,
    email: input.email,
    githubUrl: input.githubUrl ?? null,
    deploymentUrl: input.deploymentUrl ?? null,
    figmaUrl: input.figmaUrl ?? null,
    message: input.message,
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

  return submission;
};

export const getSubmissionById = async (submissionId: string): Promise<Submission | undefined> => {
  return submissionRepository.findById(submissionId);
};

export const listSubmissions = async (filters: {
  cohort?: string;
  category?: string;
  status?: "submitted" | "under_review" | "accepted" | "rejected";
  search?: string;
}): Promise<Submission[]> => {
  let submissions = await submissionRepository.list();

  if (filters.cohort) {
    submissions = submissions.filter((item) => item.cohortId === filters.cohort);
  }

  if (filters.category) {
    submissions = submissions.filter((item) => item.category === filters.category);
  }

  if (filters.status) {
    submissions = submissions.filter((item) => item.status === filters.status);
  }

  if (filters.search) {
    const term = filters.search.toLowerCase();
    submissions = submissions.filter((item) => item.email.toLowerCase().includes(term) || item.fullName.toLowerCase().includes(term));
  }

  return submissions;
};

export const updateSubmissionStatus = async (
  submissionId: string,
  status: "accepted" | "rejected",
): Promise<Submission | undefined> => {
  const submission = await submissionRepository.findById(submissionId);
  if (!submission) {
    return undefined;
  }

  submission.status = status;
  await submissionRepository.update(submission);
  return submission;
};