import { Router } from "express";
import { programController } from "../controllers/program.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get("/", programController.getAll);
router.get("/active", authenticate, programController.getActive);
router.get("/:programId/day-plans", authenticate, programController.getDayPlans);
router.get("/:programId", programController.getDetail);

export { router as programRouter };
