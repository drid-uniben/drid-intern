import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../../middleware/auth";
import { notificationRepository } from "../common/repositories";

export const notificationsRouter = Router();

notificationsRouter.get("/", authenticate, async (req: AuthenticatedRequest, res) => {
  const notifications = await notificationRepository.listForUser(req.auth!.userId);
  res.json({ success: true, data: notifications });
});

notificationsRouter.patch("/:notificationId/read", authenticate, async (req: AuthenticatedRequest, res) => {
  const notification = await notificationRepository.findById(req.params.notificationId);
  if (!notification || notification.userId !== req.auth!.userId) {
    res.status(404).json({ success: false, error: "Notification not found" });
    return;
  }

  notification.isRead = true;
  await notificationRepository.update(notification);
  res.json({ success: true, data: notification });
});
