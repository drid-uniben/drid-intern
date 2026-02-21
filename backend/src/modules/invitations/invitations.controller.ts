import crypto from "crypto";
import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { env } from "../../config/env";
import { validateBody } from "../../middleware/validate";
import { emailService } from "../../services/email.service";
import { Invitation } from "../../types/domain";
import { cohortRepository, invitationRepository } from "../common/repositories";
import { createInvitationsSchema } from "./invitations.schemas";

export const invitationsRouter = Router();

const buildInviteLink = (token: string): string => {
  const frontendBase = env.FRONTEND_URL.endsWith("/") ? env.FRONTEND_URL : `${env.FRONTEND_URL}/`;
  return new URL(`invite/${token}`, frontendBase).toString();
};

invitationsRouter.post("/", authenticate, authorize("ADMIN"), validateBody(createInvitationsSchema), async (req, res) => {
  const cohort = await cohortRepository.findById(req.body.cohortId);
  if (!cohort) {
    res.status(404).json({ success: false, error: "Cohort not found" });
    return;
  }

  const expiresAt = new Date(Date.now() + req.body.expiresInDays * 24 * 60 * 60 * 1000).toISOString();
  const invitations: Invitation[] = await Promise.all(
    req.body.emails.map((email: string) =>
      invitationRepository.create({
        email,
        cohortId: req.body.cohortId,
        category: req.body.category,
        token: crypto.randomBytes(24).toString("hex"),
        expiresAt,
      }),
    ),
  );

  void Promise.all(
    invitations.map(async (invitation) => {
      const inviteLink = buildInviteLink(invitation.token);
      try {
        await emailService.sendInvitation({
          to: invitation.email,
          inviteLink,
          category: invitation.category,
        });
      } catch {
        return;
      }
    }),
  );

  res.status(201).json({ success: true, data: invitations });
});

invitationsRouter.get("/:token", async (req, res) => {
  const invitation = await invitationRepository.findByToken(req.params.token);
  if (!invitation) {
    res.status(404).json({ success: false, error: "Invitation not found" });
    return;
  }

  if (new Date(invitation.expiresAt).getTime() < Date.now()) {
    res.status(400).json({ success: false, error: "Invitation expired" });
    return;
  }

  const cohort = await cohortRepository.findById(invitation.cohortId);
  res.json({
    success: true,
    data: {
      email: invitation.email,
      token: invitation.token,
      category: invitation.category,
      cohort,
    },
  });
});

invitationsRouter.post("/:invitationId/resend", authenticate, authorize("ADMIN"), async (req, res) => {
  const invitation = await invitationRepository.findById(req.params.invitationId);
  if (!invitation) {
    res.status(404).json({ success: false, error: "Invitation not found" });
    return;
  }

  const inviteLink = buildInviteLink(invitation.token);
  void emailService.sendInvitation({ to: invitation.email, inviteLink, category: invitation.category }).catch(() => undefined);

  res.json({ success: true, data: { message: "Invitation resend queued", invitationId: invitation.id, email: invitation.email } });
});
