export type UserRole = "ADMIN" | "REVIEWER" | "INTERN";

export type CohortStatus = "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export type Category = "backend" | "frontend" | "fullstack" | "design";

export type SubmissionStatus = "submitted" | "under_review" | "accepted" | "rejected";

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
  githubUrl: string | null;
  deploymentUrl: string | null;
  figmaUrl: string | null;
  message: string;
  status: SubmissionStatus;
  averageRating: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  submissionId: string;
  reviewerUserId: string;
  rating: number;
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
