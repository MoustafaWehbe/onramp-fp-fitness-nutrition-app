import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../../auth/types";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user; // adjust if `authenticate` attaches it under a different key
    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}

export const requireCoach = requireRole("coach", "admin");
export const requireAdmin = requireRole("admin");