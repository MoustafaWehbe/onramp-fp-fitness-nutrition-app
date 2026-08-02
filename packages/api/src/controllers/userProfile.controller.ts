import type { Request, Response, NextFunction } from "express";
import { userProfileService } from "../services/userProfile.service";

export const userProfileController = {
  async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userProfileService.getByUserId(req.user!.userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userProfileService.upsert(req.user!.userId, req.body);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
};