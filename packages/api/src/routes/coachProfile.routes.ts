import { Router } from "express";
import { coachProfileController } from "../controllers/coachProfile.controller";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import { validate } from "../middleware/validate";
import { upsertCoachProfileSchema } from "../schemas/coach.schemas";

const router = Router();

router.get("/", authenticate, authorize("coach"), coachProfileController.getMine);
router.put(
  "/",
  authenticate,
  authorize("coach"),
  validate(upsertCoachProfileSchema),
  coachProfileController.upsert,
);

export { router as coachProfileRouter };
