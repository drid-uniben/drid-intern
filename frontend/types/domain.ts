export type UserRole = "ADMIN" | "REVIEWER" | "INTERN";

export interface Cohort {
  id: string;
  year: number;
  cohortNumber: number;
  deadlineAt: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  allowedCategories: string[];
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
