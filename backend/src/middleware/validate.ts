import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateBody = <T>(schema: ZodSchema<T>) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues.map((issue) => issue.message).join(", ") });
    return;
  }

  req.body = result.data;
  next();
};

export const validateQuery = <T>(schema: ZodSchema<T>) => (req: Request, res: Response, next: NextFunction): void => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    res.status(400).json({ success: false, error: result.error.issues.map((issue) => issue.message).join(", ") });
    return;
  }

  req.query = result.data as Request["query"];
  next();
};
