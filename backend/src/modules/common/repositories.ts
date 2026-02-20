import { v4 as uuidv4 } from "uuid";
import { db } from "../../lib/inMemoryDb";
import { AuditLog, Challenge, Cohort, Invitation, Notification, Review, Submission, User } from "../../types/domain";

const nowIso = (): string => new Date().toISOString();

export const userRepository = {
  findByEmail: (email: string): User | undefined => db.users.find((user) => user.email.toLowerCase() === email.toLowerCase()),
  findById: (id: string): User | undefined => db.users.find((user) => user.id === id),
  list: (): User[] => [...db.users],
  create: (payload: Omit<User, "id" | "createdAt" | "lastLoginAt" | "refreshToken">): User => {
    const user: User = {
      id: uuidv4(),
      createdAt: nowIso(),
      lastLoginAt: null,
      refreshToken: null,
      ...payload,
    };
    db.users.push(user);
    return user;
  },
  update: (user: User): User => {
    const index = db.users.findIndex((item) => item.id === user.id);
    db.users[index] = user;
    return user;
  },
};

export const cohortRepository = {
  list: (): Cohort[] => [...db.cohorts],
  findById: (id: string): Cohort | undefined => db.cohorts.find((cohort) => cohort.id === id),
  findActive: (): Cohort | undefined => db.cohorts.find((cohort) => cohort.status === "ACTIVE"),
  create: (payload: Omit<Cohort, "id" | "createdAt" | "updatedAt">): Cohort => {
    const cohort: Cohort = { id: uuidv4(), createdAt: nowIso(), updatedAt: nowIso(), ...payload };
    db.cohorts.push(cohort);
    return cohort;
  },
  update: (cohort: Cohort): Cohort => {
    cohort.updatedAt = nowIso();
    const index = db.cohorts.findIndex((item) => item.id === cohort.id);
    db.cohorts[index] = cohort;
    return cohort;
  },
};

export const challengeRepository = {
  listByCohort: (cohortId: string): Challenge[] => db.challenges.filter((item) => item.cohortId === cohortId),
  findById: (id: string): Challenge | undefined => db.challenges.find((challenge) => challenge.id === id),
  findLatestByCohortAndCategory: (cohortId: string, category: Challenge["category"]): Challenge | undefined =>
    db.challenges
      .filter((challenge) => challenge.cohortId === cohortId && challenge.category === category)
      .sort((a, b) => b.version - a.version)[0],
  create: (payload: Omit<Challenge, "id" | "createdAt" | "updatedAt">): Challenge => {
    const challenge: Challenge = { id: uuidv4(), createdAt: nowIso(), updatedAt: nowIso(), ...payload };
    db.challenges.push(challenge);
    return challenge;
  },
};

export const invitationRepository = {
  create: (payload: Omit<Invitation, "id" | "createdAt" | "acceptedAt">): Invitation => {
    const invitation: Invitation = { id: uuidv4(), createdAt: nowIso(), acceptedAt: null, ...payload };
    db.invitations.push(invitation);
    return invitation;
  },
  findByToken: (token: string): Invitation | undefined => db.invitations.find((item) => item.token === token),
  findById: (id: string): Invitation | undefined => db.invitations.find((item) => item.id === id),
  update: (invitation: Invitation): Invitation => {
    const index = db.invitations.findIndex((item) => item.id === invitation.id);
    db.invitations[index] = invitation;
    return invitation;
  },
};

export const submissionRepository = {
  list: (): Submission[] => [...db.submissions],
  findById: (id: string): Submission | undefined => db.submissions.find((item) => item.id === id),
  findByInvitationId: (invitationId: string): Submission | undefined =>
    db.submissions.find((item) => item.invitationId === invitationId),
  create: (payload: Omit<Submission, "id" | "createdAt" | "updatedAt" | "averageRating">): Submission => {
    const submission: Submission = {
      id: uuidv4(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      averageRating: null,
      ...payload,
    };
    db.submissions.push(submission);
    return submission;
  },
  update: (submission: Submission): Submission => {
    submission.updatedAt = nowIso();
    const index = db.submissions.findIndex((item) => item.id === submission.id);
    db.submissions[index] = submission;
    return submission;
  },
};

export const reviewRepository = {
  listBySubmission: (submissionId: string): Review[] => db.reviews.filter((review) => review.submissionId === submissionId),
  create: (payload: Omit<Review, "id" | "createdAt">): Review => {
    const review: Review = { id: uuidv4(), createdAt: nowIso(), ...payload };
    db.reviews.push(review);
    return review;
  },
};

export const notificationRepository = {
  listForUser: (userId: string): Notification[] => db.notifications.filter((item) => item.userId === userId),
  findById: (id: string): Notification | undefined => db.notifications.find((item) => item.id === id),
  create: (payload: Omit<Notification, "id" | "createdAt" | "isRead">): Notification => {
    const notification: Notification = { id: uuidv4(), createdAt: nowIso(), isRead: false, ...payload };
    db.notifications.push(notification);
    return notification;
  },
  update: (notification: Notification): Notification => {
    const index = db.notifications.findIndex((item) => item.id === notification.id);
    db.notifications[index] = notification;
    return notification;
  },
};

export const auditRepository = {
  create: (payload: Omit<AuditLog, "id" | "createdAt">): AuditLog => {
    const log: AuditLog = { id: uuidv4(), createdAt: nowIso(), ...payload };
    db.auditLogs.push(log);
    return log;
  },
};
