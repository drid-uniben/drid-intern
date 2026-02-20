import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { loginSchema, refreshSchema, resetConfirmSchema, resetRequestSchema, signupSchema } from "./auth.schemas";
import { loginUser, logoutUser, refreshUserSession, signupIntern } from "./auth.usecases";

export const authRouter = Router();

authRouter.post("/signup", validateBody(signupSchema), async (req, res, next) => {
  try {
    const result = await signupIntern(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", validateBody(loginSchema), async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/refresh", validateBody(refreshSchema), async (req, res, next) => {
  try {
    const incoming = req.body.refreshToken ?? req.cookies?.refreshToken;
    if (!incoming) {
      throw new Error("Refresh token is required");
    }

    const result = await refreshUserSession(incoming);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.auth) {
      throw new Error("Unauthorized");
    }

    const result = await logoutUser(req.auth.userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/password-reset/request", validateBody(resetRequestSchema), (_req, res) => {
  res.json({ success: true, data: { message: "Password reset request accepted" } });
});

authRouter.post("/password-reset/confirm", validateBody(resetConfirmSchema), (_req, res) => {
  res.json({ success: true, data: { message: "Password reset confirmed" } });
});
