import { env } from "../config/env";
import { hashPassword } from "../lib/crypto";
import { userRepository } from "../modules/common/repositories";

export const seedAdmin = async (): Promise<void> => {
  const existing = userRepository.findByEmail(env.ADMIN_EMAIL);
  if (existing) {
    return;
  }

  const passwordHash = await hashPassword(env.ADMIN_PASSWORD);
  userRepository.create({
    fullName: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    passwordHash,
    role: "ADMIN",
    isActive: true,
    isVerified: true,
    approvedByAdmin: true,
  });
};
