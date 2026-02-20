import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import { challengeRepository, cohortRepository } from "../common/repositories";
import { createChallengeSchema, listChallengesQuerySchema, updateChallengeSchema } from "./challenges.schemas";

export const challengesRouter = Router();

challengesRouter.get("/", authenticate, authorize("ADMIN"), validateQuery(listChallengesQuerySchema), async (req, res) => {
  const cohortId = typeof req.query.cohortId === "string" ? req.query.cohortId : undefined;
  const category = typeof req.query.category === "string" ? req.query.category : undefined;

  const base = cohortId
    ? await challengeRepository.listByCohort(cohortId)
    : (await Promise.all((await cohortRepository.list()).map((cohort) => challengeRepository.listByCohort(cohort.id)))).flat();

  const filtered = category ? base.filter((item) => item.category === category) : base;

  const latest = filtered
    .sort((a, b) => b.version - a.version)
    .filter((item, index, arr) => arr.findIndex((other) => other.cohortId === item.cohortId && other.category === item.category) === index);

  res.json({ success: true, data: latest });
});

challengesRouter.get("/active", async (_req, res) => {
  const active = await cohortRepository.findActive();
  if (!active) {
    res.status(404).json({ success: false, error: "No active cohort" });
    return;
  }

  const challenges = (await challengeRepository.listByCohort(active.id))
    .sort((a, b) => b.version - a.version)
    .filter((item, index, arr) => arr.findIndex((other) => other.category === item.category) === index);

  res.json({ success: true, data: challenges });
});

challengesRouter.get("/:challengeId", async (req, res) => {
  const challenge = await challengeRepository.findById(req.params.challengeId);
  if (!challenge) {
    res.status(404).json({ success: false, error: "Challenge not found" });
    return;
  }

  res.json({ success: true, data: challenge });
});

challengesRouter.post("/", authenticate, authorize("ADMIN"), validateBody(createChallengeSchema), async (req, res) => {
  const existing = await challengeRepository.findLatestByCohortAndCategory(req.body.cohortId, req.body.category);
  const challenge = await challengeRepository.create({
    cohortId: req.body.cohortId,
    category: req.body.category,
    title: req.body.title,
    description: req.body.description,
    version: existing ? existing.version + 1 : 1,
  });

  res.status(201).json({ success: true, data: challenge });
});

challengesRouter.patch("/:challengeId", authenticate, authorize("ADMIN"), validateBody(updateChallengeSchema), async (req, res) => {
  const current = await challengeRepository.findById(req.params.challengeId);
  if (!current) {
    res.status(404).json({ success: false, error: "Challenge not found" });
    return;
  }

  const challenge = await challengeRepository.create({
    cohortId: current.cohortId,
    category: current.category,
    title: req.body.title,
    description: req.body.description,
    version: current.version + 1,
  });

  res.json({ success: true, data: challenge });
});
