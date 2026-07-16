import type { Request, Response, NextFunction } from "express";
import { programService } from "../services/program.service";

export const programController = {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const programs = await programService.getPrograms(req.user!.userId);
      res.json({ data: programs });
    } catch (err) {
      next(err);
    }
  },

  async getActive(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const program = await programService.getActiveProgram(req.user!.userId);
      res.json({ data: program });
    } catch (err) {
      next(err);
    }
  },

  async getDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { programId } = req.params;
      const program = await programService.getProgramDetail(
        req.user!.userId,
        programId as string,
      );
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
