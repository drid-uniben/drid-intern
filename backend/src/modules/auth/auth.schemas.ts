import { z } from "zod";

export const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required"
  }).email(),
  password: z.string({
    required_error: "Password is required"
  }).min(8),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).optional(),
});

export const resetRequestSchema = z.object({
  email: z.string().email(),
});

export const resetConfirmSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});
