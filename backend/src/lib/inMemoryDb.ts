import { AuditLog, Challenge, Cohort, Invitation, Notification, Review, Submission, User } from "../types/domain";

export interface InMemoryDb {
  users: User[];
  cohorts: Cohort[];
  challenges: Challenge[];
  invitations: Invitation[];
  submissions: Submission[];
  reviews: Review[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  revokedRefreshTokens: string[];
}

export const db: InMemoryDb = {
  users: [],
  cohorts: [],
  challenges: [],
  invitations: [],
  submissions: [],
  reviews: [],
  notifications: [],
  auditLogs: [],
  revokedRefreshTokens: [],
};
