import { Router } from "express";
import { programController } from "../controllers/program.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// Static routes first so they don't get shadowed by "/:programId/...".
router.get("/", authenticate, programController.list);
router.get("/active", authenticate, programController.getActive);
router.get("/catalog/:slug", authenticate, programController.getBySlug);
router.get("/:programId/day-plans", authenticate, programController.getDayPlans);

export { router as programRouter };
