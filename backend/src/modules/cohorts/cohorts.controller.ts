import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { cohortRepository } from "../common/repositories";
import { createCohortSchema, updateCohortSchema, updateStatusSchema } from "./cohorts.schemas";

export const cohortsRouter = Router();

cohortsRouter.get("/active", (_req, res) => {
  const active = cohortRepository.findActive();
  if (!active) {
    res.status(404).json({ success: false, error: "No active cohort" });
    return;
  }

  res.json({ success: true, data: active });
});

cohortsRouter.get("/", authenticate, authorize("ADMIN"), (_req, res) => {
  res.json({ success: true, data: cohortRepository.list() });
});

cohortsRouter.get("/:cohortId", (req, res) => {
  const cohort = cohortRepository.findById(req.params.cohortId);
  if (!cohort) {
    res.status(404).json({ success: false, error: "Cohort not found" });
    return;
  }

  res.json({ success: true, data: cohort });
});

cohortsRouter.post("/", authenticate, authorize("ADMIN"), validateBody(createCohortSchema), (req, res) => {
  const cohort = cohortRepository.create({
    year: req.body.year,
    cohortNumber: req.body.cohortNumber,
    deadlineAt: req.body.deadlineAt,
    status: "DRAFT",
    allowedCategories: req.body.allowedCategories,
  });

  res.status(201).json({ success: true, data: cohort });
});

cohortsRouter.patch("/:cohortId", authenticate, authorize("ADMIN"), validateBody(updateCohortSchema), (req, res) => {
  const cohort = cohortRepository.findById(req.params.cohortId);
  if (!cohort) {
    res.status(404).json({ success: false, error: "Cohort not found" });
    return;
  }

  if (req.body.year !== undefined) cohort.year = req.body.year;
  if (req.body.cohortNumber !== undefined) cohort.cohortNumber = req.body.cohortNumber;
  if (req.body.deadlineAt !== undefined) cohort.deadlineAt = req.body.deadlineAt;
  if (req.body.allowedCategories !== undefined) cohort.allowedCategories = req.body.allowedCategories;

  cohortRepository.update(cohort);
  res.json({ success: true, data: cohort });
});

cohortsRouter.patch("/:cohortId/status", authenticate, authorize("ADMIN"), validateBody(updateStatusSchema), (req, res) => {
  const cohort = cohortRepository.findById(req.params.cohortId);
  if (!cohort) {
    res.status(404).json({ success: false, error: "Cohort not found" });
    return;
  }

  if (req.body.status === "ACTIVE") {
    const active = cohortRepository.findActive();
    if (active && active.id !== cohort.id) {
      active.status = "CLOSED";
      cohortRepository.update(active);
    }
  }

  cohort.status = req.body.status;
  cohortRepository.update(cohort);
  res.json({ success: true, data: cohort });
});
