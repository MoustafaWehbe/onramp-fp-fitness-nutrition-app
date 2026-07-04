import type { Request, Response, NextFunction } from "express";
import { programService } from "../services/program.service";

export const programController = {
  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const program = await programService.getActiveProgram(req.user!.userId);
      res.json({ data: program });
    } catch (err) {
      next(err);
    }
  },

  async getDayPlans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { programId } = req.params;
      const dayPlans = await programService.getDayPlans(programId as string);
      res.json({ data: dayPlans });
    } catch (err) {
      next(err);
    }
  },
};