export type UserRole = "ADMIN" | "REVIEWER" | "INTERN";

export interface Cohort {
  id: string;
  year: number;
  cohortNumber: number;
  deadlineAt: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "ACTIVE" | "CLOSED" | "ARCHIVED";
  allowedCategories: Array<"backend" | "frontend" | "fullstack" | "design">;
}

export interface Challenge {
  id: string;
  cohortId: string;
  category: "backend" | "frontend" | "fullstack" | "design";
  title: string;
  description: string;
  version: number;
}

export interface InvitationValidation {
  email: string;
  token: string;
  category: "backend" | "frontend" | "fullstack" | "design";
  cohort: Cohort;
}

export interface SessionUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  approvedByAdmin: boolean;
}
