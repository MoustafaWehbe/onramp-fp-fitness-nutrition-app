import type { Request, Response, NextFunction } from "express";
import { logService } from "../services/log.service";

export const logController = {
  async getLogsForDay(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dayPlanId } = req.params;
        const result = await logService.getLogsForDay(dayPlanId as string, req.user!.userId);
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },

  async saveLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { meals, workout } = req.body;
      const result = await logService.saveLogs({
        userId: req.user!.userId,
        meals,
        workout,
      });
      res.json({ data: result });
    } catch (err) {
      next(err);
    }
  },
};