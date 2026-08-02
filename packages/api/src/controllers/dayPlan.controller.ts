import type { Request, Response, NextFunction } from "express";
import { dayPlanService } from "../services/dayPlan.service";

export const dayPlanController = {
  async getFullDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dayPlanId } = req.params;
      const dayPlan = await dayPlanService.getFullDetail(dayPlanId as string);
      res.json({ data: dayPlan });
    } catch (err) {
      next(err);
    }
  },
};  