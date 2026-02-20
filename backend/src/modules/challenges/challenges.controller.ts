import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { challengeRepository, cohortRepository } from "../common/repositories";
import { createChallengeSchema, updateChallengeSchema } from "./challenges.schemas";

export const challengesRouter = Router();

challengesRouter.get("/active", (_req, res) => {
  const active = cohortRepository.findActive();
  if (!active) {
    res.status(404).json({ success: false, error: "No active cohort" });
    return;
  }

  const challenges = challengeRepository.listByCohort(active.id)
    .sort((a, b) => b.version - a.version)
    .filter((item, index, arr) => arr.findIndex((other) => other.category === item.category) === index);

  res.json({ success: true, data: challenges });
});

challengesRouter.get("/:challengeId", (req, res) => {
  const challenge = challengeRepository.findById(req.params.challengeId);
  if (!challenge) {
    res.status(404).json({ success: false, error: "Challenge not found" });
    return;
  }

  res.json({ success: true, data: challenge });
});

challengesRouter.post("/", authenticate, authorize("ADMIN"), validateBody(createChallengeSchema), (req, res) => {
  const existing = challengeRepository.findLatestByCohortAndCategory(req.body.cohortId, req.body.category);
  const challenge = challengeRepository.create({
    cohortId: req.body.cohortId,
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    version: existing ? existing.version + 1 : 1,
  });

  res.status(201).json({ success: true, data: challenge });
});

challengesRouter.patch("/:challengeId", authenticate, authorize("ADMIN"), validateBody(updateChallengeSchema), (req, res) => {
  const current = challengeRepository.findById(req.params.challengeId);
  if (!current) {
    res.status(404).json({ success: false, error: "Challenge not found" });
    return;
  }

  const challenge = challengeRepository.create({
    cohortId: current.cohortId,
    category: current.category,
    title: req.body.title,
    description: req.body.description,
    version: current.version + 1,
  });

  res.json({ success: true, data: challenge });
});
