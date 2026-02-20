import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessPayload {
  userId: string;
  role: "ADMIN" | "REVIEWER" | "INTERN";
  email: string;
}

export const hashPassword = async (plain: string): Promise<string> => bcrypt.hash(plain, 12);

export const comparePassword = async (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash);

export const signAccessToken = (payload: AccessPayload): string =>
  jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

export const signRefreshToken = (payload: AccessPayload): string =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): AccessPayload =>
  jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;

export const verifyRefreshToken = (token: string): AccessPayload =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as AccessPayload;
