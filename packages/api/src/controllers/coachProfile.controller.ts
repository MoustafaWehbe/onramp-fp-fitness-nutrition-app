import type { Request, Response, NextFunction } from "express";
import { coachProfileService } from "../services/coachProfile.service";

export const coachProfileController = {
  async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await coachProfileService.getByUserId(req.user!.userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await coachProfileService.upsert(req.user!.userId, req.body);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
};