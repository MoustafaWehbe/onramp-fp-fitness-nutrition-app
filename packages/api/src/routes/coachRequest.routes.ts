import { Router } from "express";
import { coachRequestController } from "../controllers/coachRequest.controller";
import { authenticate } from "../middleware/authenticate";
import { requireCoach } from "../middleware/requireRole";

const router = Router();

router.post("/", authenticate, coachRequestController.create);
router.get("/mine", authenticate, coachRequestController.getMine);
router.get("/pending", authenticate, requireCoach, coachRequestController.listPending);
router.patch("/:coachRequestId/accept", authenticate, requireCoach, coachRequestController.accept);

export { router as coachRequestRouter };