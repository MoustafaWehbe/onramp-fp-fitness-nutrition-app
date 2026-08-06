import type { Request, Response, NextFunction } from "express";
import { coachProfileService } from "../services/coachProfile.service";
import type { UpsertCoachProfileInput } from "../schemas/coach.schemas";

export const coachProfileController = {
  async getMine(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const profile = await coachProfileService.getByUserId(req.user!.userId);
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },

  async upsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // `validate` has replaced req.body with the parsed, allowlisted result.
      const profile = await coachProfileService.upsert(
        req.user!.userId,
        req.body as UpsertCoachProfileInput,
      );
      res.json({ data: profile });
    } catch (err) {
      next(err);
    }
  },
};
