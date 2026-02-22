import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { challengeCategoryRepository, cohortRepository } from "../common/repositories";
import { createCohortSchema, updateCohortSchema, updateStatusSchema } from "./cohorts.schemas";

export const cohortsRouter = Router();

cohortsRouter.get("/active", async (_req, res) => {
  const active = await cohortRepository.findActive();
  if (!active) {
    res.status(404).json({ success: false, error: "No active cohort" });
    return;
  }

  res.json({ success: true, data: active });
});

cohortsRouter.get("/", authenticate, authorize("ADMIN"), async (_req, res) => {
  res.json({ success: true, data: await cohortRepository.list() });
});

cohortsRouter.get("/:cohortId", async (req, res) => {
  const cohort = await cohortRepository.findById(req.params.cohortId);
  if (!cohort) {
    res.status(404).json({ success: false, error: "Cohort not found" });
    return;
  }

  res.json({ success: true, data: cohort });
});

cohortsRouter.post("/", authenticate, authorize("ADMIN"), validateBody(createCohortSchema), async (req, res) => {
  const allowedCategories = req.body.allowedCategories.map((item: string) => item.trim().toLowerCase());
  const activeCategories = await challengeCategoryRepository.listActive();
  const activeNames = new Set(activeCategories.map((item) => item.name));
  if (allowedCategories.some((item: string) => !activeNames.has(item))) {
    res.status(400).json({ success: false, error: "Invalid allowed category provided" });
    return;
  }

  const cohort = await cohortRepository.create({
    year: req.body.year,
    cohortNumber: req.body.cohortNumber,
    deadlineAt: req.body.deadlineAt,
    status: "DRAFT",
    allowedCategories,
  });

  res.status(201).json({ success: true, data: cohort });
});

cohortsRouter.patch("/:cohortId", authenticate, authorize("ADMIN"), validateBody(updateCohortSchema), async (req, res) => {
  const cohort = await cohortRepository.findById(req.params.cohortId);
  if (!cohort) {
    res.status(404).json({ success: false, error: "Cohort not found" });
    return;
  }

  if (req.body.year !== undefined) cohort.year = req.body.year;
  if (req.body.cohortNumber !== undefined) cohort.cohortNumber = req.body.cohortNumber;
  if (req.body.deadlineAt !== undefined) cohort.deadlineAt = req.body.deadlineAt;
  if (req.body.allowedCategories !== undefined) {
    const allowedCategories = req.body.allowedCategories.map((item: string) => item.trim().toLowerCase());
    const activeCategories = await challengeCategoryRepository.listActive();
    const activeNames = new Set(activeCategories.map((item) => item.name));
    if (allowedCategories.some((item: string) => !activeNames.has(item))) {
      res.status(400).json({ success: false, error: "Invalid allowed category provided" });
      return;
    }
    cohort.allowedCategories = allowedCategories;
  }

  await cohortRepository.update(cohort);
  res.json({ success: true, data: cohort });
});

cohortsRouter.patch("/:cohortId/status", authenticate, authorize("ADMIN"), validateBody(updateStatusSchema), async (req, res) => {
  const cohort = await cohortRepository.findById(req.params.cohortId);
  if (!cohort) {
    res.status(404).json({ success: false, error: "Cohort not found" });
    return;
  }

  if (req.body.status === "ACTIVE") {
    const active = await cohortRepository.findActive();
    if (active && active.id !== cohort.id) {
      active.status = "CLOSED";
      await cohortRepository.update(active);
    }
  }

  cohort.status = req.body.status;
  await cohortRepository.update(cohort);
  res.json({ success: true, data: cohort });
});
