import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { AuditLog, Challenge, Cohort, Invitation, Notification, Review, Submission, User } from "../../types/domain";

const toUser = (user: {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "REVIEWER" | "INTERN";
  isActive: boolean;
  isVerified: boolean;
  approvedByAdmin: boolean;
  refreshToken: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
}): User => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  passwordHash: user.passwordHash,
  role: user.role,
  isActive: user.isActive,
  isVerified: user.isVerified,
  approvedByAdmin: user.approvedByAdmin,
  refreshToken: user.refreshToken,
  createdAt: user.createdAt.toISOString(),
  lastLoginAt: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
});

const toCohort = (cohort: {
  id: string;
  year: number;
  cohortNumber: number;
  deadlineAt: Date;
  status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  allowedCategories: Array<"backend" | "frontend" | "fullstack" | "design">;
  createdAt: Date;
  updatedAt: Date;
}): Cohort => ({
  id: cohort.id,
  year: cohort.year,
  cohortNumber: cohort.cohortNumber,
  deadlineAt: cohort.deadlineAt.toISOString(),
  status: cohort.status,
  allowedCategories: cohort.allowedCategories,
  createdAt: cohort.createdAt.toISOString(),
  updatedAt: cohort.updatedAt.toISOString(),
});

const toChallenge = (challenge: {
  id: string;
  cohortId: string;
  category: "backend" | "frontend" | "fullstack" | "design";
  title: string;
  description: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}): Challenge => ({
  id: challenge.id,
  cohortId: challenge.cohortId,
  category: challenge.category,
  title: challenge.title,
  description: challenge.description,
  version: challenge.version,
  createdAt: challenge.createdAt.toISOString(),
  updatedAt: challenge.updatedAt.toISOString(),
});

const toInvitation = (invitation: {
  id: string;
  email: string;
  cohortId: string;
  category: "backend" | "frontend" | "fullstack" | "design";
  token: string;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
}): Invitation => ({
  id: invitation.id,
  email: invitation.email,
  cohortId: invitation.cohortId,
  category: invitation.category,
  token: invitation.token,
  expiresAt: invitation.expiresAt.toISOString(),
  acceptedAt: invitation.acceptedAt ? invitation.acceptedAt.toISOString() : null,
  createdAt: invitation.createdAt.toISOString(),
});

const toSubmission = (submission: {
  id: string;
  cohortId: string;
  invitationId: string;
  category: "backend" | "frontend" | "fullstack" | "design";
  fullName: string;
  email: string;
  githubUrl: string | null;
  deploymentUrl: string | null;
  figmaUrl: string | null;
  message: string;
  status: "submitted" | "under_review" | "accepted" | "rejected";
  averageRating: number | null;
  createdAt: Date;
  updatedAt: Date;
}): Submission => ({
  id: submission.id,
  cohortId: submission.cohortId,
  invitationId: submission.invitationId,
  category: submission.category,
  fullName: submission.fullName,
  email: submission.email,
  githubUrl: submission.githubUrl,
  deploymentUrl: submission.deploymentUrl,
  figmaUrl: submission.figmaUrl,
  message: submission.message,
  status: submission.status,
  averageRating: submission.averageRating,
  createdAt: submission.createdAt.toISOString(),
  updatedAt: submission.updatedAt.toISOString(),
});

const toReview = (review: {
  id: string;
  submissionId: string;
  reviewerUserId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}): Review => ({
  id: review.id,
  submissionId: review.submissionId,
  reviewerUserId: review.reviewerUserId,
  rating: review.rating,
  comment: review.comment,
  createdAt: review.createdAt.toISOString(),
});

const toNotification = (notification: {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "NEW_USER_REGISTERED" | "INVITATION_ACCEPTED" | "NEW_SUBMISSION" | "REVIEW_ADDED" | "STATUS_CHANGED";
  isRead: boolean;
  createdAt: Date;
}): Notification => ({
  id: notification.id,
  userId: notification.userId,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  isRead: notification.isRead,
  createdAt: notification.createdAt.toISOString(),
});

const toAuditLog = (auditLog: {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Prisma.JsonValue;
  createdAt: Date;
}): AuditLog => ({
  id: auditLog.id,
  userId: auditLog.userId,
  action: auditLog.action,
  entityType: auditLog.entityType,
  entityId: auditLog.entityId,
  metadata: (auditLog.metadata ?? {}) as Record<string, unknown>,
  createdAt: auditLog.createdAt.toISOString(),
});

export const userRepository = {
  findByEmail: async (email: string): Promise<User | undefined> => {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? toUser(user) : undefined;
  },
  findById: async (id: string): Promise<User | undefined> => {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? toUser(user) : undefined;
  },
  list: async (): Promise<User[]> => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    return users.map(toUser);
  },
  create: async (payload: Omit<User, "id" | "createdAt" | "lastLoginAt" | "refreshToken">): Promise<User> => {
    const user = await prisma.user.create({
      data: {
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        passwordHash: payload.passwordHash,
        role: payload.role,
        isActive: payload.isActive,
        isVerified: payload.isVerified,
        approvedByAdmin: payload.approvedByAdmin,
      },
    });

    return toUser(user);
  },
  update: async (user: User): Promise<User> => {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: user.fullName,
        email: user.email.toLowerCase(),
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        approvedByAdmin: user.approvedByAdmin,
        refreshToken: user.refreshToken,
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : null,
      },
    });

    return toUser(updated);
  },
};

export const cohortRepository = {
  list: async (): Promise<Cohort[]> => {
    const cohorts = await prisma.cohort.findMany({ orderBy: [{ year: "desc" }, { cohortNumber: "desc" }] });
    return cohorts.map(toCohort);
  },
  findById: async (id: string): Promise<Cohort | undefined> => {
    const cohort = await prisma.cohort.findUnique({ where: { id } });
    return cohort ? toCohort(cohort) : undefined;
  },
  findActive: async (): Promise<Cohort | undefined> => {
    const cohort = await prisma.cohort.findFirst({ where: { status: "ACTIVE" } });
    return cohort ? toCohort(cohort) : undefined;
  },
  create: async (payload: Omit<Cohort, "id" | "createdAt" | "updatedAt">): Promise<Cohort> => {
    const cohort = await prisma.cohort.create({
      data: {
        year: payload.year,
        cohortNumber: payload.cohortNumber,
        deadlineAt: new Date(payload.deadlineAt),
        status: payload.status,
        allowedCategories: payload.allowedCategories,
      },
    });

    return toCohort(cohort);
  },
  update: async (cohort: Cohort): Promise<Cohort> => {
    const updated = await prisma.cohort.update({
      where: { id: cohort.id },
      data: {
        year: cohort.year,
        cohortNumber: cohort.cohortNumber,
        deadlineAt: new Date(cohort.deadlineAt),
        status: cohort.status,
        allowedCategories: cohort.allowedCategories,
      },
    });

    return toCohort(updated);
  },
};

export const challengeRepository = {
  listByCohort: async (cohortId: string): Promise<Challenge[]> => {
    const challenges = await prisma.challenge.findMany({ where: { cohortId }, orderBy: { version: "desc" } });
    return challenges.map(toChallenge);
  },
  findById: async (id: string): Promise<Challenge | undefined> => {
    const challenge = await prisma.challenge.findUnique({ where: { id } });
    return challenge ? toChallenge(challenge) : undefined;
  },
  findLatestByCohortAndCategory: async (cohortId: string, category: Challenge["category"]): Promise<Challenge | undefined> => {
    const challenge = await prisma.challenge.findFirst({ where: { cohortId, category }, orderBy: { version: "desc" } });
    return challenge ? toChallenge(challenge) : undefined;
  },
  create: async (payload: Omit<Challenge, "id" | "createdAt" | "updatedAt">): Promise<Challenge> => {
    const challenge = await prisma.challenge.create({
      data: {
        cohortId: payload.cohortId,
        category: payload.category,
        title: payload.title,
        description: payload.description,
        version: payload.version,
      },
    });

    return toChallenge(challenge);
  },
};

export const invitationRepository = {
  create: async (payload: Omit<Invitation, "id" | "createdAt" | "acceptedAt">): Promise<Invitation> => {
    const invitation = await prisma.invitation.create({
      data: {
        email: payload.email.toLowerCase(),
        cohortId: payload.cohortId,
        category: payload.category,
        token: payload.token,
        expiresAt: new Date(payload.expiresAt),
      },
    });

    return toInvitation(invitation);
  },
  findByToken: async (token: string): Promise<Invitation | undefined> => {
    const invitation = await prisma.invitation.findUnique({ where: { token } });
    return invitation ? toInvitation(invitation) : undefined;
  },
  findById: async (id: string): Promise<Invitation | undefined> => {
    const invitation = await prisma.invitation.findUnique({ where: { id } });
    return invitation ? toInvitation(invitation) : undefined;
  },
  update: async (invitation: Invitation): Promise<Invitation> => {
    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        email: invitation.email.toLowerCase(),
        cohortId: invitation.cohortId,
        category: invitation.category,
        token: invitation.token,
        expiresAt: new Date(invitation.expiresAt),
        acceptedAt: invitation.acceptedAt ? new Date(invitation.acceptedAt) : null,
      },
    });

    return toInvitation(updated);
  },
};

export const submissionRepository = {
  list: async (): Promise<Submission[]> => {
    const submissions = await prisma.submission.findMany({ orderBy: { createdAt: "desc" } });
    return submissions.map(toSubmission);
  },
  findById: async (id: string): Promise<Submission | undefined> => {
    const submission = await prisma.submission.findUnique({ where: { id } });
    return submission ? toSubmission(submission) : undefined;
  },
  findByInvitationId: async (invitationId: string): Promise<Submission | undefined> => {
    const submission = await prisma.submission.findUnique({ where: { invitationId } });
    return submission ? toSubmission(submission) : undefined;
  },
  create: async (payload: Omit<Submission, "id" | "createdAt" | "updatedAt" | "averageRating">): Promise<Submission> => {
    const submission = await prisma.submission.create({
      data: {
        cohortId: payload.cohortId,
        invitationId: payload.invitationId,
        category: payload.category,
        fullName: payload.fullName,
        email: payload.email.toLowerCase(),
        githubUrl: payload.githubUrl,
        deploymentUrl: payload.deploymentUrl,
        figmaUrl: payload.figmaUrl,
        message: payload.message,
        status: payload.status,
      },
    });

    return toSubmission(submission);
  },
  update: async (submission: Submission): Promise<Submission> => {
    const updated = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        cohortId: submission.cohortId,
        invitationId: submission.invitationId,
        category: submission.category,
        fullName: submission.fullName,
        email: submission.email.toLowerCase(),
        githubUrl: submission.githubUrl,
        deploymentUrl: submission.deploymentUrl,
        figmaUrl: submission.figmaUrl,
        message: submission.message,
        status: submission.status,
        averageRating: submission.averageRating,
      },
    });

    return toSubmission(updated);
  },
};

export const reviewRepository = {
  listBySubmission: async (submissionId: string): Promise<Review[]> => {
    const reviews = await prisma.review.findMany({ where: { submissionId }, orderBy: { createdAt: "desc" } });
    return reviews.map(toReview);
  },
  create: async (payload: Omit<Review, "id" | "createdAt">): Promise<Review> => {
    const review = await prisma.review.create({
      data: {
        submissionId: payload.submissionId,
        reviewerUserId: payload.reviewerUserId,
        rating: payload.rating,
        comment: payload.comment,
      },
    });

    return toReview(review);
  },
};

export const notificationRepository = {
  listForUser: async (userId: string): Promise<Notification[]> => {
    const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return notifications.map(toNotification);
  },
  findById: async (id: string): Promise<Notification | undefined> => {
    const notification = await prisma.notification.findUnique({ where: { id } });
    return notification ? toNotification(notification) : undefined;
  },
  create: async (payload: Omit<Notification, "id" | "createdAt" | "isRead">): Promise<Notification> => {
    const notification = await prisma.notification.create({
      data: {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
      },
    });

    return toNotification(notification);
  },
  update: async (notification: Notification): Promise<Notification> => {
    const updated = await prisma.notification.update({
      where: { id: notification.id },
      data: {
        userId: notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
      },
    });

    return toNotification(updated);
  },
};

export const auditRepository = {
  create: async (payload: Omit<AuditLog, "id" | "createdAt">): Promise<AuditLog> => {
    const log = await prisma.auditLog.create({
      data: {
        userId: payload.userId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId,
        metadata: payload.metadata as Prisma.InputJsonValue,
      },
    });

    return toAuditLog(log);
  },
  list: async (): Promise<AuditLog[]> => {
    const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" } });
    return logs.map(toAuditLog);
  },
};

export const adminStatsRepository = {
  getStats: async (): Promise<{ totalSubmissions: number; accepted: number; rejected: number; pending: number; cohorts: number; users: number }> => {
    const [totalSubmissions, accepted, rejected, pending, cohorts, users] = await Promise.all([
      prisma.submission.count(),
      prisma.submission.count({ where: { status: "accepted" } }),
      prisma.submission.count({ where: { status: "rejected" } }),
      prisma.submission.count({ where: { OR: [{ status: "submitted" }, { status: "under_review" }] } }),
      prisma.cohort.count(),
      prisma.user.count(),
    ]);

    return { totalSubmissions, accepted, rejected, pending, cohorts, users };
  },
};
