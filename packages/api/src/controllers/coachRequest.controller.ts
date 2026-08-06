import type { Request, Response, NextFunction } from "express";
import { coachRequestService } from "../services/coachRequest.service";

export const coachRequestController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { coachId, message } = req.body;
    const request = await coachRequestService.create(req.user!.userId, coachId, message);
    res.status(201).json({ data: request });
  } catch (err) {
    next(err);
  }
},

  async getMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const request = await coachRequestService.getForUser(userId);
      res.json({ data: request });
    } catch (err) {
      next(err);
    }
  },

  async listPending(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const requests = await coachRequestService.listPending(req.user!.userId);
    res.json({ data: requests });
  } catch (err) {
    next(err);
  }
},

  async accept(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coachId = req.user!.userId;
      const { coachRequestId } = req.params;
      const request = await coachRequestService.accept(coachRequestId as string, coachId);
      res.json({ data: request });
    } catch (err) {
      next(err);
    }
  },
};