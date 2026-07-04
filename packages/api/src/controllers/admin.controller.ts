// packages/api/src/controllers/admin.controller.ts
import type { Request, Response, NextFunction } from "express";
import { User, Program } from "../models";

export const adminController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await User.findAll({
        // attributes: ["id", "name", "email", "role", "createdAt"],
        order: [["createdAt", "DESC"]],
      });
      res.json({ data: users });
    } catch (err) {
      next(err);
    }
  },

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const totalUsers = await User.count();
      const totalPrograms = await Program.count();
      const avgResult = await Program.findOne({
        attributes: [
          [Program.sequelize!.fn("AVG", Program.sequelize!.col("adherence_rate")), "avg"],
        ],
        raw: true,
      }) as any;

      res.json({
        data: {
          totalUsers,
          totalPrograms,
          avgAdherenceRate: Math.round(avgResult?.avg ?? 0),
        },
      });
    } catch (err) {
      next(err);
    }
  },
};  