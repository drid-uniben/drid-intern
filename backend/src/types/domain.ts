export type UserRole = "ADMIN" | "REVIEWER" | "INTERN";

export type CohortStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export type Category = string;

export type SubmissionStatus = "submitted" | "under_review" | "accepted" | "rejected";

export type Recommendation = "RECOMMEND" | "NEUTRAL" | "DO_NOT_RECOMMEND";

export type NotificationType =
  | "NEW_USER_REGISTERED"
  | "INVITATION_ACCEPTED"
  | "NEW_SUBMISSION"
  | "REVIEW_ADDED"
  | "STATUS_CHANGED";

export interface User {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  approvedByAdmin: boolean;
  refreshToken: string | null;
}

export interface Cohort {
  id: string;
  year: number;
  cohortNumber: number;
  deadlineAt: string;
  status: CohortStatus;
  allowedCategories: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: string;
  cohortId: string;
  category: Category;
  title: string;
  description: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  cohortId: string;
  category: Category;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface Submission {
  id: string;
  cohortId: string;
  invitationId: string;
  category: Category;
  fullName: string;
  email: string;
  repoUrl: string | null;
  liveLink: string | null;
  designLinks: string | null;
  message: string;
  status: SubmissionStatus;
  averageRating: number | null;
  assignedReviewerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChallengeCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  submissionId: string;
  reviewerUserId: string;
  rating: number;
  criteriaScores: any | null; // using any for JSON structure { label, score, comment }
  recommendation: Recommendation | null;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface OutboundEmailFilter {
  cohortId: string | null;
  status: SubmissionStatus | null;
  category: string | null;
}

export interface OutboundEmailRecipient {
  submissionId: string;
  fullName: string;
  email: string;
  category: string;
  status: SubmissionStatus;
}

export interface OutboundEmail {
  id: string;
  cohortId: string | null;
  sentByUserId: string;
  subject: string;
  htmlBody: string;
  filters: OutboundEmailFilter;
  recipients: OutboundEmailRecipient[];
  attemptedCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
}
