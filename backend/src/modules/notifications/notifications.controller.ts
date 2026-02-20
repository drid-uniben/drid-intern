import { Router } from "express";
import { authenticate, AuthenticatedRequest } from "../../middleware/auth";
import { notificationRepository } from "../common/repositories";

export const notificationsRouter = Router();

notificationsRouter.get("/", authenticate, (req: AuthenticatedRequest, res) => {
  const notifications = notificationRepository.listForUser(req.auth!.userId);
  res.json({ success: true, data: notifications });
});

notificationsRouter.patch("/:notificationId/read", authenticate, (req: AuthenticatedRequest, res) => {
  const notification = notificationRepository.findById(req.params.notificationId);
  if (!notification || notification.userId !== req.auth!.userId) {
    res.status(404).json({ success: false, error: "Notification not found" });
    return;
  }

  notification.isRead = true;
  notificationRepository.update(notification);
  res.json({ success: true, data: notification });
});
