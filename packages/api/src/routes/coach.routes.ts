import { Router } from "express";
import { coachController } from "../controllers/coach.controller";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get("/", authenticate, coachController.listAvailable);

export { router as coachRouter };