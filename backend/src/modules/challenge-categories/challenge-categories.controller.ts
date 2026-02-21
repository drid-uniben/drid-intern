import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { challengeCategoryRepository } from "../common/repositories";
import { createChallengeCategorySchema } from "./challenge-categories.schemas";

export const challengeCategoriesRouter = Router();

challengeCategoriesRouter.get("/", async (_req, res) => {
  const categories = await challengeCategoryRepository.listActive();
  res.json({ success: true, data: categories });
});

challengeCategoriesRouter.get("/admin", authenticate, authorize("ADMIN"), async (_req, res) => {
  const categories = await challengeCategoryRepository.list();
  res.json({ success: true, data: categories });
});

challengeCategoriesRouter.post("/", authenticate, authorize("ADMIN"), validateBody(createChallengeCategorySchema), async (req, res) => {
  const name = req.body.name.trim().toLowerCase();
  const existing = await challengeCategoryRepository.findByName(name);
  if (existing) {
    res.status(409).json({ success: false, error: "Category already exists" });
    return;
  }

  const category = await challengeCategoryRepository.create(name);
  res.status(201).json({ success: true, data: category });
});
