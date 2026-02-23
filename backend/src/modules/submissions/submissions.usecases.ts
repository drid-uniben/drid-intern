import crypto from "crypto";
import { challengeRepository, cohortRepository, invitationRepository, notificationRepository, submissionRepository, userRepository } from "../common/repositories";
import { validateSubmissionRequirements } from "./submissions.schemas";
import { Submission } from "../../types/domain";

interface CreateSubmissionInput {
  invitationToken?: string;
  category?: string;
  fullName: string;
  email: string;
  repoUrl?: string;
  liveLink?: string;
  designLinks?: string;
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
    repoUrl: input.repoUrl,
    liveLink: input.liveLink,
    designLinks: input.designLinks,
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
    repoUrl: input.repoUrl ?? null,
    liveLink: input.liveLink ?? null,
    designLinks: input.designLinks ?? null,
    message: input.message,
    status: "submitted",
    assignedReviewerId: null,
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
  reviewerId?: string;
  page?: number;
  limit?: number;
}): Promise<{ data: Submission[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
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

  if (filters.reviewerId) {
    submissions = submissions.filter((item) => item.assignedReviewerId === filters.reviewerId);
  }

  const total = submissions.length;
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const limit = filters.limit && filters.limit > 0 ? filters.limit : (total > 0 ? total : 10);

  if (filters.page || filters.limit) {
    const start = (page - 1) * limit;
    submissions = submissions.slice(start, start + limit);
  }

  return {
    data: submissions,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    }
  };
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

export const assignReviewerToSubmissions = async (
  submissionIds: string[],
  reviewerId: string,
): Promise<Submission[]> => {
  const reviewer = await userRepository.findById(reviewerId);
  if (!reviewer) {
    throw new Error("Reviewer not found");
  }

  if (reviewer.role !== "REVIEWER" && reviewer.role !== "ADMIN") {
    throw new Error("User is not authorized to review submissions");
  }

  const updatedSubmissions: Submission[] = [];

  for (const id of submissionIds) {
    const submission = await submissionRepository.findById(id);
    if (submission) {
      submission.assignedReviewerId = reviewer.id;
      // You could optionally set the status to "under_review" here if that's desired when assigned, 
      // but usually it's "under_review" once a review actually starts or is submitted.
      const updated = await submissionRepository.update(submission);
      updatedSubmissions.push(updated);
    }
  }

  return updatedSubmissions;
};