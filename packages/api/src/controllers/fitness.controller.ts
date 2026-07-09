import type { Request, Response, NextFunction } from "express";
import { fitnessService } from "../services/fitness.service";

export const fitnessController = {
  async summary(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const summary = await fitnessService.getSummary(req.user!.userId);
      res.json({ data: summary });
    } catch (err) {
      next(err);
    }
  },

  async saveMeasurement(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const measurements = await fitnessService.saveMeasurement(
        req.user!.userId,
        req.body,
      );
      res.json({ data: { measurements } });
    } catch (err) {
      next(err);
    }
  },

  async sendChat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await fitnessService.addChatTurn(
        req.user!.userId,
        req.body.message,
      );
      res.json({ data: { messages } });
    } catch (err) {
      next(err);
    }
  },
};
