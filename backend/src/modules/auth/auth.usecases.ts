import { comparePassword, hashPassword, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/crypto";
import { db } from "../../lib/inMemoryDb";
import { notificationRepository, userRepository } from "../common/repositories";
import { User } from "../../types/domain";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const toAuthUser = (user: User) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  approvedByAdmin: user.approvedByAdmin,
});

const issueTokens = (user: User): Tokens => {
  const payload = { userId: user.id, role: user.role, email: user.email };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

export const signupIntern = async (input: { fullName: string; email: string; password: string }) => {
  const existing = userRepository.findByEmail(input.email);
  if (existing) {
    throw new Error("Email already registered");
  }

  const user = userRepository.create({
    fullName: input.fullName,
    email: input.email,
    passwordHash: await hashPassword(input.password),
    role: "INTERN",
    isActive: true,
    isVerified: true,
    approvedByAdmin: false,
  });

  const admins = userRepository.list().filter((item) => item.role === "ADMIN");
  admins.forEach((admin) => {
    notificationRepository.create({
      userId: admin.id,
      title: "New user signup",
      message: `${user.fullName} registered and is waiting for approval`,
      type: "NEW_USER_REGISTERED",
    });
  });

  return { success: true, data: toAuthUser(user) };
};

export const loginUser = async (input: { email: string; password: string }) => {
  const user = userRepository.findByEmail(input.email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.isActive || !user.approvedByAdmin) {
    throw new Error("Account is pending admin approval");
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }

  const tokens = issueTokens(user);
  user.lastLoginAt = new Date().toISOString();
  user.refreshToken = tokens.refreshToken;
  userRepository.update(user);

  return { success: true, data: { ...tokens, user: toAuthUser(user) } };
};

export const refreshUserSession = (refreshToken: string) => {
  if (db.revokedRefreshTokens.includes(refreshToken)) {
    throw new Error("Refresh token has been revoked");
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = userRepository.findById(payload.userId);

  if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
    throw new Error("Invalid refresh token");
  }

  const tokens = issueTokens(user);
  db.revokedRefreshTokens.push(refreshToken);
  user.refreshToken = tokens.refreshToken;
  userRepository.update(user);

  return { success: true, data: tokens };
};

export const logoutUser = (userId: string) => {
  const user = userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (user.refreshToken) {
    db.revokedRefreshTokens.push(user.refreshToken);
  }

  user.refreshToken = null;
  userRepository.update(user);
  return { success: true, data: { message: "Logged out" } };
};
