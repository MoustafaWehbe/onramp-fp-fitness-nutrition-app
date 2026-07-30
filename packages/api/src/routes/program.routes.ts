import { Router } from "express";
import { programController } from "../controllers/program.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Static routes first so they do not get shadowed by "/:programId/...".
router.get("/", programController.getAll);
router.get("/active", authenticate, programController.getActive);
router.get("/catalog/:slug", programController.getBySlug);
router.get("/:programId/day-plans", authenticate, programController.getDayPlans);
router.get("/:programId", programController.getDetail);

export { router as programRouter };
