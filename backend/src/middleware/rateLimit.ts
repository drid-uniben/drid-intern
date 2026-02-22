import { rateLimit } from "express-rate-limit";
import { env } from "../config/env";

const createLimiter = (options: { max: number; windowMs?: number; message: string }) => {
  return rateLimit({
    windowMs: options.windowMs ?? env.RATE_LIMIT_WINDOW_MS,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: options.message,
    },
  });
};

export const apiRateLimiter = createLimiter({
  max: env.RATE_LIMIT_MAX,
  message: "Too many requests. Please try again shortly.",
});

export const authRateLimiter = createLimiter({
  max: env.AUTH_RATE_LIMIT_MAX,
  message: "Too many authentication attempts. Please try again later.",
});

export const submissionRateLimiter = createLimiter({
  max: env.SUBMISSION_RATE_LIMIT_MAX,
  message: "Too many submission attempts. Please try again later.",
});