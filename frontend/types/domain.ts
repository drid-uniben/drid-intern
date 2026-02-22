export type UserRole = "ADMIN" | "REVIEWER" | "INTERN";

export type SubmissionStatus = "submitted" | "under_review" | "accepted" | "rejected";

export type Recommendation = "RECOMMEND" | "NEUTRAL" | "DO_NOT_RECOMMEND";

export interface Cohort {
  id: string;
  year: number;
  cohortNumber: number;
  deadlineAt: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  allowedCategories: string[];
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

export interface Submission {
  id: string;
  cohortId: string;
  invitationId: string;
  category: string; // Changed from Category to string to match existing Challenge.category
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

export interface Challenge {
  id: string;
  cohortId: string;
  category: string;
  title: string;
  description: string;
  version: number;
}

export interface InvitationValidation {
  email: string;
  token: string;
  category: string;
  cohort: Cohort;
}

export interface ChallengeCategory {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  approvedByAdmin: boolean;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  approvedByAdmin: boolean;
  isActive: boolean;
}
