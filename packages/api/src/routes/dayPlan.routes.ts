import { Router } from "express";
import { dayPlanController } from "../controllers/dayPlan.controller";
import { logController } from "../controllers/log.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get("/:dayPlanId", authenticate, dayPlanController.getFullDetail);
router.get("/:dayPlanId/logs", authenticate, logController.getLogsForDay);
router.post("/:dayPlanId/logs", authenticate, logController.saveLogs);

export { router as dayPlanRouter };