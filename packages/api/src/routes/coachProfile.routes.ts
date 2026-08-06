import { Router } from "express";
import { coachProfileController } from "../controllers/coachProfile.controller";
import { authenticate } from "../middleware/authenticate";
import { requireCoach } from "../middleware/requireRole";

const router = Router();

router.get("/", authenticate, requireCoach, coachProfileController.getMine);
router.put("/", authenticate, requireCoach, coachProfileController.upsert);

export { router as coachProfileRouter };