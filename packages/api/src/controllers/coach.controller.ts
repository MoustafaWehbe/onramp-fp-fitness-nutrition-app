import type { Request, Response, NextFunction } from "express";
import { coachService } from "../services/coach.service";

export const coachController = {
  async listAvailable(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coaches = await coachService.listAvailable();
      res.json({ data: coaches });
    } catch (err) {
      next(err);
    }
  },
};