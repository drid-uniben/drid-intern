import { NextFunction, Request, Response } from "express";
import { UserRole } from "../types/domain";
import { verifyAccessToken } from "../lib/crypto";

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: UserRole;
    email: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing bearer token" });
    return;
  }

  try {
    const token = header.replace("Bearer ", "");
    const payload = verifyAccessToken(token);
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Invalid or expired access token" });
  }
};

export const authorize = (...roles: UserRole[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.auth) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  if (!roles.includes(req.auth.role)) {
    res.status(403).json({ success: false, error: "Forbidden" });
    return;
  }

  next();
};
