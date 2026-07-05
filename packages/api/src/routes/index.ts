import { Router } from "express";
import { authRouter } from "./auth.routes";
import { programRouter } from "./program.routes";
import { dayPlanRouter } from "./dayPlan.routes";
import { adminRouter } from "./admin.routes";     

const router = Router();

router.use("/auth", authRouter);
router.use("/programs", programRouter);
router.use("/day-plans", dayPlanRouter);
router.use("/admin", adminRouter);                 

export { router };