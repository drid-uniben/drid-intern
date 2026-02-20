import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { db } from "../../lib/inMemoryDb";

export const adminRouter = Router();

adminRouter.get("/stats", authenticate, authorize("ADMIN"), (_req, res) => {
  const total = db.submissions.length;
  const accepted = db.submissions.filter((item) => item.status === "accepted").length;
  const rejected = db.submissions.filter((item) => item.status === "rejected").length;
  const pending = db.submissions.filter((item) => item.status === "submitted" || item.status === "under_review").length;

  res.json({
    success: true,
    data: {
      totalSubmissions: total,
      accepted,
      rejected,
      pending,
      cohorts: db.cohorts.length,
      users: db.users.length,
    },
  });
});

adminRouter.get("/audit-logs", authenticate, authorize("ADMIN"), (_req, res) => {
  res.json({ success: true, data: db.auditLogs });
});
