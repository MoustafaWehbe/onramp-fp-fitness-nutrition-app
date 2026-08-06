import type { Request, Response, NextFunction } from "express";
import { coachRequestService } from "../services/coachRequest.service";

export const coachRequestController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { coachId, message } = req.body;
      const request = await coachRequestService.create(
        req.user!.userId,
        coachId,
        message,
      );
      res.status(201).json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async getMine(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const request = await coachRequestService.getForUser(req.user!.userId);
      res.json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async listPending(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const requests = await coachRequestService.listPending(req.user!.userId);
      res.json({ data: requests });
    } catch (err) {
      next(err);
    }
  },

  async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { coachRequestId } = req.params;
      const request = await coachRequestService.accept(
        coachRequestId as string,
        req.user!.userId,
      );
      res.json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async decline(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { coachRequestId } = req.params;
      const request = await coachRequestService.decline(
        coachRequestId as string,
        req.user!.userId,
      );
      res.json({ data: request });
    } catch (err) {
      next(err);
    }
  },
};
