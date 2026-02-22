import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import { env } from "./config/env";
import { errorHandler, notFound } from "./middleware/error";
import { apiRateLimiter, authRateLimiter, submissionRateLimiter } from "./middleware/rateLimit";
import { requestLogger } from "./middleware/requestLogger";
import { adminRouter } from "./modules/admin/admin.controller";
import { authRouter } from "./modules/auth/auth.controller";
import { challengeCategoriesRouter } from "./modules/challenge-categories/challenge-categories.controller";
import { challengesRouter } from "./modules/challenges/challenges.controller";
import { cohortsRouter } from "./modules/cohorts/cohorts.controller";
import { invitationsRouter } from "./modules/invitations/invitations.controller";
import { notificationsRouter } from "./modules/notifications/notifications.controller";
import { publicRouter } from "./modules/public/public.controller";
import { reviewsRouter } from "./modules/reviews/reviews.controller";
import { submissionsRouter } from "./modules/submissions/submissions.controller";
import { usersRouter } from "./modules/users/users.controller";

export const app = express();

app.set("trust proxy", env.TRUST_PROXY);

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1", apiRateLimiter);

app.use("/api/v1/auth", authRateLimiter, authRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/cohorts", cohortsRouter);
app.use("/api/v1/challenges", challengesRouter);
app.use("/api/v1/challenge-categories", challengeCategoriesRouter);
app.use("/api/v1/invitations", invitationsRouter);
app.use("/api/v1/submissions", submissionRateLimiter, submissionsRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/notifications", notificationsRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/public", publicRouter);

app.use(notFound);
app.use(errorHandler);
