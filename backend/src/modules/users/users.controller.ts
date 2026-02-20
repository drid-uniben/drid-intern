import { Router } from "express";
import { z } from "zod";
import { authenticate, authorize, AuthenticatedRequest } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { notificationRepository, userRepository } from "../common/repositories";

const roleSchema = z.object({
  role: z.enum(["ADMIN", "REVIEWER", "INTERN"]),
});

export const usersRouter = Router();

usersRouter.get("/me", authenticate, (req: AuthenticatedRequest, res) => {
  const user = req.auth ? userRepository.findById(req.auth.userId) : undefined;
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  res.json({
    success: true,
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      approvedByAdmin: user.approvedByAdmin,
    },
  });
});

usersRouter.get("/", authenticate, authorize("ADMIN"), (_req, res) => {
  const users = userRepository.list().map((user) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    approvedByAdmin: user.approvedByAdmin,
    isActive: user.isActive,
  }));

  res.json({ success: true, data: users });
});

usersRouter.patch("/:userId/approve", authenticate, authorize("ADMIN"), (req, res) => {
  const user = userRepository.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  user.approvedByAdmin = true;
  userRepository.update(user);

  notificationRepository.create({
    userId: user.id,
    title: "Account approved",
    message: "Your account has been approved by an administrator",
    type: "STATUS_CHANGED",
  });

  res.json({ success: true, data: { message: "User approved" } });
});

usersRouter.patch("/:userId/role", authenticate, authorize("ADMIN"), validateBody(roleSchema), (req, res) => {
  const user = userRepository.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  user.role = req.body.role;
  userRepository.update(user);
  res.json({ success: true, data: { message: "Role updated" } });
});
