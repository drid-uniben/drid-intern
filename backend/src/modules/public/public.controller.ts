import { Router } from "express";
import { challengeRepository, cohortRepository } from "../common/repositories";

export const publicRouter = Router();

publicRouter.get("/cohort", async (_req, res) => {
  const active = await cohortRepository.findActive();
  if (!active) {
    res.status(404).json({ success: false, error: "No active cohort" });
    return;
  }

  res.json({ success: true, data: active });
});

publicRouter.get("/challenges", async (_req, res) => {
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
